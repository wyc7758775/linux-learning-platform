import { PassThrough } from 'stream'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ContainerCapacityError,
  ContainerManager,
  type ContainerSession,
} from '../src/docker/containerManager.js'

class FakeExec {
  constructor(
    private readonly output = '',
    private readonly exitCode = 0,
  ) {}

  async start(): Promise<NodeJS.ReadableStream> {
    const stream = new PassThrough()
    queueMicrotask(() => {
      if (this.output) {
        stream.write(this.output)
      }
      stream.end()
    })
    return stream
  }

  async inspect(): Promise<{ Running: boolean; ExitCode: number }> {
    return {
      Running: false,
      ExitCode: this.exitCode,
    }
  }
}

class HangingExec {
  async start(): Promise<NodeJS.ReadableStream> {
    return new PassThrough()
  }

  async inspect(): Promise<{ Running: boolean; ExitCode: number }> {
    return {
      Running: true,
      ExitCode: 0,
    }
  }
}

class FakeContainer {
  public readonly execCalls: Array<Record<string, unknown>> = []
  public started = false
  public stopCalls = 0
  public running = true

  constructor(public readonly id: string) {}

  async start(): Promise<void> {
    this.started = true
  }

  async stop(): Promise<void> {
    this.stopCalls += 1
    this.running = false
  }

  async exec(options: Record<string, unknown>): Promise<FakeExec> {
    this.execCalls.push(options)

    const command = Array.isArray(options.Cmd)
      ? options.Cmd.join(' ')
      : ''

    if (command.includes('sleep-forever')) {
      return new HangingExec() as unknown as FakeExec
    }

    if (options.User === 'player') {
      return new FakeExec(`[${this.id}] ${command}`)
    }

    return new FakeExec('')
  }

  async inspect(): Promise<{ State: { Running: boolean } }> {
    return {
      State: {
        Running: this.running,
      },
    }
  }
}

class FakeDocker {
  public readonly createdContainers: FakeContainer[] = []
  private readonly containers = new Map<string, FakeContainer>()
  private sequence = 0
  public nextCreateBarrier: Promise<void> | null = null
  public createFailuresRemaining = 0

  async listImages(): Promise<Array<{ RepoTags?: string[] }>> {
    return [{ RepoTags: ['linux-learning-level:latest'] }]
  }

  async createContainer(): Promise<FakeContainer> {
    if (this.nextCreateBarrier) {
      await this.nextCreateBarrier
      this.nextCreateBarrier = null
    }

    if (this.createFailuresRemaining > 0) {
      this.createFailuresRemaining -= 1
      throw new Error('simulated pool creation failure')
    }

    const container = new FakeContainer(`container-${this.sequence += 1}`)
    this.createdContainers.push(container)
    this.containers.set(container.id, container)
    return container
  }

  getContainer(id: string): FakeContainer {
    const container = this.containers.get(id)
    if (!container) {
      throw new Error(`Unknown container: ${id}`)
    }
    return container
  }

  async buildImage(): Promise<NodeJS.ReadableStream> {
    const stream = new PassThrough()
    queueMicrotask(() => stream.end())
    return stream
  }
}

function getStoredSession(manager: ContainerManager, sessionId: string): ContainerSession {
  return (manager as unknown as { sessions: Map<string, ContainerSession> }).sessions.get(sessionId)!
}

function getPoolSize(manager: ContainerManager): number {
  return (manager as unknown as { pool: unknown[] }).pool.length
}

describe('ContainerManager lifecycle management', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('expires idle sessions and keeps the session record for rebuild', async () => {
    vi.useFakeTimers()

    let now = 0
    const docker = new FakeDocker()
    const manager = new ContainerManager({
      docker: docker as never,
      now: () => now,
      idleTimeoutMs: 30_000,
      idleCheckIntervalMs: 5_000,
      expiredSessionRetentionMs: 60_000,
      poolSize: 0,
    })

    const session = await manager.createContainer(1)
    manager.startIdleCheck()

    now = 31_000
    await vi.advanceTimersByTimeAsync(5_000)

    const storedSession = getStoredSession(manager, session.id)
    const container = docker.getContainer(session.containerId)

    expect(storedSession.expired).toBe(true)
    expect(container.stopCalls).toBe(1)

    await manager.cleanup()
  })

  it('rejects new containers at the active session limit and allows creation after expiry', async () => {
    const docker = new FakeDocker()
    const manager = new ContainerManager({
      docker: docker as never,
      maxContainers: 1,
      poolSize: 0,
    })

    const session = await manager.createContainer(1)

    await expect(manager.createContainer(2)).rejects.toBeInstanceOf(ContainerCapacityError)

    await (manager as unknown as { expireSession: (session: ContainerSession) => Promise<void> })
      .expireSession(getStoredSession(manager, session.id))

    await expect(manager.createContainer(2)).resolves.toMatchObject({ levelId: 2 })

    await manager.cleanup()
  })

  it('acquires containers from the warm pool and replenishes asynchronously', async () => {
    const docker = new FakeDocker()
    const manager = new ContainerManager({
      docker: docker as never,
      poolSize: 2,
    })

    await manager.warmPool()

    const pooledContainerId = docker.createdContainers[0].id
    const session = await manager.createContainer(1)

    await Promise.resolve()
    await Promise.resolve()

    expect(session.containerId).toBe(pooledContainerId)
    expect(getPoolSize(manager)).toBe(2)
    expect(docker.createdContainers).toHaveLength(3)

    await manager.cleanup()
  })

  it('rebuilds expired sessions, resets state, and marks the command as reconnected', async () => {
    const docker = new FakeDocker()
    const manager = new ContainerManager({
      docker: docker as never,
      poolSize: 0,
    })

    const session = await manager.createContainer(5)
    const originalContainerId = session.containerId
    const storedSession = getStoredSession(manager, session.id)

    storedSession.currentDir = '/tmp/custom'
    storedSession.commandHistory.push('touch /tmp/custom-file')
    await (manager as unknown as { expireSession: (session: ContainerSession) => Promise<void> })
      .expireSession(storedSession)

    const result = await manager.executeCommand(session.id, 'pwd')

    expect(result.reconnected).toBe(true)
    expect(result.currentDir).toBe('/home/player')
    expect(result.output).toContain('/bin/sh -c cd "/home/player" && pwd')
    expect(storedSession.containerId).not.toBe(originalContainerId)
    expect(storedSession.commandHistory).toEqual(['ls', 'pwd', 'clear', 'pwd'])

    await manager.cleanup()
  })

  it('prunes expired sessions that were not rebuilt within the retention window', async () => {
    vi.useFakeTimers()

    let now = 0
    const docker = new FakeDocker()
    const manager = new ContainerManager({
      docker: docker as never,
      now: () => now,
      idleTimeoutMs: 30_000,
      idleCheckIntervalMs: 5_000,
      expiredSessionRetentionMs: 20_000,
      poolSize: 0,
    })

    const session = await manager.createContainer(1)
    manager.startIdleCheck()

    now = 31_000
    await vi.advanceTimersByTimeAsync(5_000)
    expect(getStoredSession(manager, session.id).expired).toBe(true)

    now = 56_000
    await vi.advanceTimersByTimeAsync(5_000)

    const sessions = (manager as unknown as { sessions: Map<string, ContainerSession> }).sessions
    expect(sessions.has(session.id)).toBe(false)

    await manager.cleanup()
  })

  it('serializes concurrent rebuilds so only one replacement container is created', async () => {
    let releaseCreate: (() => void) | undefined
    const docker = new FakeDocker()
    const manager = new ContainerManager({
      docker: docker as never,
      poolSize: 0,
    })

    const session = await manager.createContainer(1)
    const storedSession = getStoredSession(manager, session.id)

    await (manager as unknown as { expireSession: (session: ContainerSession) => Promise<void> })
      .expireSession(storedSession)

    docker.nextCreateBarrier = new Promise<void>((resolve) => {
      releaseCreate = resolve
    })

    const firstCommand = manager.executeCommand(session.id, 'pwd')
    const secondCommand = manager.executeCommand(session.id, 'ls')

    releaseCreate?.()

    const [firstResult, secondResult] = await Promise.all([firstCommand, secondCommand])

    expect(docker.createdContainers).toHaveLength(2)
    expect([firstResult.reconnected, secondResult.reconnected].filter(Boolean)).toHaveLength(1)
    expect(firstResult.currentDir).toBe('/home/player')
    expect(secondResult.currentDir).toBe('/home/player')

    await manager.cleanup()
  })

  it('retries warming the pool after an asynchronous refill failure', async () => {
    vi.useFakeTimers()

    const docker = new FakeDocker()
    docker.createFailuresRemaining = 1

    const manager = new ContainerManager({
      docker: docker as never,
      poolSize: 1,
    })

    await manager.warmPool()
    expect(getPoolSize(manager)).toBe(0)

    await vi.advanceTimersByTimeAsync(5_000)

    expect(getPoolSize(manager)).toBe(1)
    expect(docker.createdContainers).toHaveLength(1)

    await manager.cleanup()
  })

  it('returns a timeout hint when a player command never exits', async () => {
    vi.useFakeTimers()

    const docker = new FakeDocker()
    const manager = new ContainerManager({
      docker: docker as never,
      poolSize: 0,
    })

    const session = await manager.createContainer(1)
    const resultPromise = manager.executeCommand(session.id, 'sleep-forever')

    await vi.advanceTimersByTimeAsync(10_000)
    const result = await resultPromise

    expect(result.output).toContain('命令执行超时')

    await manager.cleanup()
  })
})
