import Docker from 'dockerode'
import { v4 as uuidv4 } from 'uuid'

export interface ContainerSession {
  id: string
  containerId: string
  levelId: number
  createdAt: Date
  lastActiveAt: Date
  expired: boolean
  expiredAt: Date | null
  rebuilding: boolean
  currentDir: string
  commandHistory: string[]
}

export interface ExecuteCommandResult {
  output: string
  currentDir: string
  reconnected: boolean
}

interface ContainerManagerOptions {
  docker?: Pick<Docker, 'listImages' | 'createContainer' | 'getContainer' | 'buildImage'>
  now?: () => number
  idleTimeoutMs?: number
  idleCheckIntervalMs?: number
  expiredSessionRetentionMs?: number
  maxContainers?: number
  poolSize?: number
}

export class ContainerCapacityError extends Error {
  constructor(message = '当前资源不足，请稍后再试') {
    super(message)
    this.name = 'ContainerCapacityError'
  }
}

export class ContainerManager {
  private readonly docker: Pick<Docker, 'listImages' | 'createContainer' | 'getContainer' | 'buildImage'>
  private readonly sessions: Map<string, ContainerSession> = new Map()
  private readonly imageName = process.env.LEVEL_IMAGE_NAME || 'linux-learning-level'
  private readonly now: () => number
  private readonly idleTimeoutMs: number
  private readonly idleCheckIntervalMs: number
  private readonly expiredSessionRetentionMs: number
  private readonly maxContainers: number
  private readonly poolSize: number

  private readonly PRIVILEGED_COMMANDS = [
    'adduser', 'useradd', 'userdel', 'usermod',
    'groupadd', 'groupdel', 'groupmod',
    'passwd', 'chown', 'chgrp',
    'nginx', 'systemctl', 'service',
  ]

  // Each level may need a pre-configured environment before handing control to player.
  private readonly LEVEL_SETUP_COMMANDS: Record<number, string[]> = {
    7: ['adduser -D alice'],
    9: ['adduser -D alice'],
    12: ['adduser -D alice'],
    13: ['/usr/local/bin/stress-worker > /dev/null 2>&1 &'],
    15: ['nc -l -p 8080 > /dev/null 2>&1 &'],
    21: ['mkdir -p /home/player/my-app/dist && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><div id=\\"app\\"></div><script src=\\"/assets/index.js\\"></script></body></html>" > /home/player/my-app/dist/index.html && echo "console.log(\\"Hello Vue!\\")" > /home/player/my-app/dist/assets/index.js && chown -R player:player /home/player/my-app/dist'],
    22: ['mkdir -p /home/player/my-app/dist && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><div id=\\"app\\"></div><script src=\\"/assets/index.js\\"></script></body></html>" > /home/player/my-app/dist/index.html && echo "console.log(\\"Hello Vue!\\")" > /home/player/my-app/dist/assets/index.js && chown -R player:player /home/player/my-app/dist'],
    23: ['mkdir -p /home/player/my-app/dist && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><div id=\\"app\\"></div><script src=\\"/assets/index.js\\"></script></body></html>" > /home/player/my-app/dist/index.html && echo "console.log(\\"Hello Vue!\\")" > /home/player/my-app/dist/assets/index.js && chown -R player:player /home/player/my-app/dist'],
    24: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><h1>Hello Nginx!</h1></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    25: ['chown -R player:player /etc/nginx/http.d'],
    27: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><h1>Hello Nginx!</h1></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html'],
    28: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><h1>Hello Nginx!</h1></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html'],
    29: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><h1>Hello Nginx!</h1></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html'],
    30: ['rm -f /etc/nginx/http.d/default.conf && /usr/local/bin/mock-api > /dev/null 2>&1 & sleep 1 && echo "server { listen 80 default_server; location / { proxy_pass http://127.0.0.1:3000; } }" > /etc/nginx/http.d/myapp.conf'],
    34: ['chmod u+s /usr/bin/crontab'],
    35: ['chown -R player:player /etc/logrotate.d'],
    45: ['echo "important data" > /home/player/testfile.tmp && chown player:player /home/player/testfile.tmp'],
    52: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    53: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    54: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    55: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    57: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    59: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    60: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html'],
  }

  private readonly LEVEL_PRESET_HISTORY: Record<number, string[]> = {
    5: ['ls', 'pwd', 'clear'],
  }

  private pool: Docker.Container[] = []
  private poolRefillsInFlight = 0
  private idleCheckTimer: ReturnType<typeof setInterval> | undefined
  private poolRetryTimer: ReturnType<typeof setTimeout> | undefined
  private idleCheckInProgress = false
  private imageEnsured = false
  private imageEnsurePromise: Promise<void> | undefined
  private readonly rebuildPromises: Map<string, Promise<void>> = new Map()
  private shuttingDown = false

  constructor(options: ContainerManagerOptions = {}) {
    this.docker = options.docker ?? new Docker()
    this.now = options.now ?? Date.now
    this.idleTimeoutMs = options.idleTimeoutMs ?? 30 * 60 * 1000
    this.idleCheckIntervalMs = options.idleCheckIntervalMs ?? 60 * 1000
    this.expiredSessionRetentionMs = options.expiredSessionRetentionMs ?? 2 * 60 * 60 * 1000
    this.maxContainers = options.maxContainers ?? 20
    this.poolSize = options.poolSize ?? 3
  }

  async initialize(): Promise<void> {
    this.shuttingDown = false
    this.startIdleCheck()
    await this.warmPool()
  }

  startIdleCheck(): void {
    if (this.idleCheckTimer) {
      return
    }

    this.idleCheckTimer = setInterval(() => {
      if (this.idleCheckInProgress) {
        return
      }

      this.idleCheckInProgress = true
      void this.expireIdleSessions().finally(() => {
        this.idleCheckInProgress = false
      })
    }, this.idleCheckIntervalMs)
  }

  async warmPool(targetSize = this.poolSize): Promise<void> {
    if (targetSize <= 0 || this.shuttingDown) {
      return
    }

    await this.ensureImageExists()

    const missing = Math.max(0, targetSize - (this.pool.length + this.poolRefillsInFlight))
    if (missing === 0) {
      return
    }

    const creations = Array.from({ length: missing }, () => this.createAndStorePoolContainer())
    await Promise.all(creations)
  }

  async createContainer(levelId: number): Promise<ContainerSession> {
    if (this.shuttingDown) {
      throw new Error('服务正在关闭，暂时无法创建容器')
    }

    this.assertCapacity()

    const sessionId = uuidv4()
    const session = await this.provisionSession(sessionId, levelId)
    this.sessions.set(sessionId, session)

    console.log(`Container created for session ${sessionId} (level ${levelId})`)
    return session
  }

  async executeCommand(sessionId: string, command: string): Promise<ExecuteCommandResult> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      console.error(`Session not found: ${sessionId}. Available sessions:`, Array.from(this.sessions.keys()))
      throw new Error(`Session not found: ${sessionId}`)
    }

    const reconnected = await this.ensureSessionReady(session)
    session.lastActiveAt = new Date(this.now())

    if (command.trim() !== 'history') {
      session.commandHistory.push(command.trim())
    }

    if (command.trim() === 'history') {
      return { output: this.getHistoryOutput(session), currentDir: session.currentDir, reconnected }
    }

    const output = await this.executeInContainer(session, command)
    return { output, currentDir: session.currentDir, reconnected }
  }

  getCommandHistory(sessionId: string): string[] {
    const session = this.sessions.get(sessionId)
    return session ? [...session.commandHistory] : []
  }

  async destroyContainer(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return
    }

    this.sessions.delete(sessionId)

    try {
      await this.stopContainerById(session.containerId)
    } catch {
      // Container may already be stopped or removed.
    }
  }

  async cleanup(): Promise<void> {
    this.shuttingDown = true
    this.stopIdleCheck()

    const destroyPromises = Array.from(this.sessions.keys()).map(sessionId =>
      this.destroyContainer(sessionId)
    )

    await Promise.allSettled(destroyPromises)
    this.sessions.clear()

    const pool = [...this.pool]
    this.pool = []
    await Promise.allSettled(pool.map(container => this.stopContainer(container)))
    this.clearPoolRetryTimer()
  }

  async checkFileExists(sessionId: string, filePath: string): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return false
    }

    const container = this.docker.getContainer(session.containerId)

    try {
      const fullPath = filePath.startsWith('/')
        ? filePath
        : session.currentDir + '/' + filePath

      const exec = await container.exec({
        Cmd: ['test', '-f', this.normalizePath(fullPath)],
        AttachStdout: true,
        AttachStderr: true,
      })

      const stream = await exec.start({ Detach: false })
      await new Promise<void>((resolve) => {
        stream.on('data', () => {})
        stream.on('end', resolve)
        stream.on('error', resolve)
      })
      const inspect = await exec.inspect()
      return inspect.ExitCode === 0
    } catch {
      return false
    }
  }

  async getFileContent(sessionId: string, filePath: string): Promise<string> {
    const result = await this.executeCommand(sessionId, `cat ${filePath}`)
    return result.output
  }

  async checkDirectoryExists(sessionId: string, dirPath: string): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return false
    }

    const container = this.docker.getContainer(session.containerId)

    try {
      const fullPath = dirPath.startsWith('/')
        ? dirPath
        : session.currentDir + '/' + dirPath

      const exec = await container.exec({
        Cmd: ['test', '-d', this.normalizePath(fullPath)],
        AttachStdout: true,
        AttachStderr: true,
      })

      const stream = await exec.start({ Detach: false })
      await new Promise<void>((resolve) => {
        stream.on('data', () => {})
        stream.on('end', resolve)
        stream.on('error', resolve)
      })
      const inspect = await exec.inspect()
      return inspect.ExitCode === 0
    } catch {
      return false
    }
  }

  async getFilePermission(sessionId: string, filePath: string): Promise<string> {
    const result = await this.executeCommand(sessionId, `stat -c '%a' ${filePath}`)
    return result.output.trim()
  }

  async getFileGroup(sessionId: string, filePath: string): Promise<string> {
    const result = await this.executeCommand(sessionId, `stat -c '%G' ${filePath}`)
    return result.output.trim()
  }

  async checkPermissionExists(sessionId: string, permission: string): Promise<boolean> {
    const result = await this.executeCommand(
      sessionId,
      `find /home/player -maxdepth 1 -type f -perm ${permission} 2>/dev/null | head -1`
    )
    return result.output.trim().length > 0
  }

  async checkUserExists(sessionId: string, username: string): Promise<boolean> {
    const result = await this.executeCommand(sessionId, `id ${username} 2>/dev/null`)
    return result.output.includes('uid=')
  }

  async checkUserInGroup(sessionId: string, username: string, groupname: string): Promise<boolean> {
    const result = await this.executeCommand(sessionId, `groups ${username} 2>/dev/null`)
    console.log(`[checkUserInGroup] groups output: ${JSON.stringify(result.output)}, checking for: ${groupname}`)
    return result.output.includes(groupname)
  }

  private async createAndStorePoolContainer(): Promise<void> {
    this.poolRefillsInFlight += 1

    try {
      const container = await this.createBaseContainer(`linux-learning-pool-${uuidv4().substring(0, 8)}`)
      if (this.shuttingDown) {
        await this.stopContainer(container).catch(() => {})
        return
      }
      this.pool.push(container)
      console.log(`Pool replenished. Pool size: ${this.pool.length}`)
    } catch (error) {
      console.error('Failed to create pooled container:', error)
      this.schedulePoolRetry()
    } finally {
      this.poolRefillsInFlight -= 1
    }
  }

  private async ensureSessionReady(session: ContainerSession): Promise<boolean> {
    const inFlightRebuild = this.rebuildPromises.get(session.id)
    if (inFlightRebuild) {
      try {
        await inFlightRebuild
        return false
      } catch (error) {
        this.throwRebuildError(error)
      }
    }

    if (!session.expired) {
      return false
    }

    session.rebuilding = true

    const rebuildPromise = (async () => {
      const rebuilt = await this.provisionSession(session.id, session.levelId)

      if (this.shuttingDown || this.sessions.get(session.id) !== session) {
        await this.stopContainerById(rebuilt.containerId).catch(() => {})
        throw new Error(`Session not found: ${session.id}`)
      }

      session.containerId = rebuilt.containerId
      session.createdAt = rebuilt.createdAt
      session.lastActiveAt = rebuilt.lastActiveAt
      session.expiredAt = null
      session.currentDir = rebuilt.currentDir
      session.commandHistory = rebuilt.commandHistory
      session.expired = false

      console.log(`Expired session rebuilt: ${session.id}`)
    })().finally(() => {
      session.rebuilding = false
      this.rebuildPromises.delete(session.id)
    })

    this.rebuildPromises.set(session.id, rebuildPromise)

    try {
      await rebuildPromise
      return true
    } catch (error) {
      this.throwRebuildError(error)
    }
  }

  private async provisionSession(sessionId: string, levelId: number): Promise<ContainerSession> {
    this.assertCapacity()

    const container = await this.acquireContainer(`linux-learning-${sessionId.substring(0, 8)}`)

    try {
      await this.runLevelSetup(container, levelId)
    } catch (error) {
      await this.stopContainer(container).catch(() => {})
      throw error
    }

    const now = new Date(this.now())
    return {
      id: sessionId,
      containerId: container.id,
      levelId,
      createdAt: now,
      lastActiveAt: now,
      expired: false,
      expiredAt: null,
      rebuilding: false,
      currentDir: this.getInitialCurrentDir(levelId),
      commandHistory: [...(this.LEVEL_PRESET_HISTORY[levelId] || [])],
    }
  }

  private getInitialCurrentDir(levelId: number): string {
    return levelId === 3 ? '/tmp' : '/home/player'
  }

  private getHistoryOutput(session: ContainerSession): string {
    if (session.commandHistory.length === 0) {
      return ''
    }

    return '\r\n' + session.commandHistory
      .map((cmd, index) => `    ${index + 1}  ${cmd}`)
      .join('\r\n')
  }

  private elevatePrivilegedCommands(command: string): string {
    const parts = command.split(/(&&|\|\||;)/)
    const elevated = parts.map((part, i) => {
      if (i % 2 === 1) return part

      const trimmed = part.trim()
      const needsSudo = this.PRIVILEGED_COMMANDS.some(cmd =>
        trimmed.startsWith(cmd + ' ') || trimmed === cmd
      )

      if (!needsSudo) {
        return part
      }

      let processed = trimmed
      const adduserMatch = processed.match(/^(adduser)\s+(?!.*-D)(.*)$/)
      if (adduserMatch) {
        processed = `adduser -D ${adduserMatch[2]}`
      }
      if (/^groupadd(\s|$)/.test(processed) && !processed.includes('|| true')) {
        processed = `${processed} 2>/dev/null || true`
      }

      return part.replace(trimmed, `/usr/bin/sudo ${processed}`)
    })

    return elevated.join('').replace(/(sudo groupadd \S+)\s*&&/g, '$1 2>/dev/null; ')
  }

  private async executeInContainer(session: ContainerSession, command: string): Promise<string> {
    const container = this.docker.getContainer(session.containerId)

    try {
      const cdMatch = command.match(/^cd\s+(.+)$/)
      if (cdMatch) {
        return this.handleCdCommand(session, cdMatch[1])
      }

      const elevatedCommand = this.elevatePrivilegedCommands(command)
      const fullCommand = `cd "${session.currentDir}" && ${elevatedCommand}`

      console.log(`[Exec] Running: ${fullCommand}`)

      const exec = await container.exec({
        Cmd: ['/bin/sh', '-c', fullCommand],
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        User: 'player',
      })

      const stream = await exec.start({ Detach: false, Tty: true })

      return new Promise((resolve, reject) => {
        let output = ''
        let resolved = false
        const COMMAND_TIMEOUT_MS = 10_000
        let poll: ReturnType<typeof setInterval> | undefined
        let timeoutHandle: ReturnType<typeof setTimeout> | undefined

        const done = () => {
          if (!resolved) {
            resolved = true
            if (poll) clearInterval(poll)
            if (timeoutHandle) clearTimeout(timeoutHandle)
            console.log('[Exec] Output:', JSON.stringify(output))
            resolve(output)
          }
        }

        stream.on('data', (chunk: Buffer) => {
          output += chunk.toString()
        })

        stream.on('end', done)
        stream.on('error', reject)

        poll = setInterval(async () => {
          try {
            const info = await exec.inspect()
            if (!info.Running) {
              done()
            }
          } catch {
            done()
          }
        }, 200)

        timeoutHandle = setTimeout(async () => {
          if (!resolved) {
            console.log(`[Exec] Command timed out after ${COMMAND_TIMEOUT_MS}ms: ${fullCommand}`)
            try {
              const killExec = await container.exec({
                Cmd: ['/bin/sh', '-c', `pkill -f "${elevatedCommand.replace(/"/g, '\\"')}" 2>/dev/null || true`],
                AttachStdout: true,
                AttachStderr: true,
                User: 'root',
              })
              await killExec.start({ Detach: false })
            } catch {
              // Ignore kill errors.
            }
            output += '\r\n\x1b[33m⚠ 命令执行超时。此命令可能需要交互输入，请尝试非交互方式（如 adduser -D <用户名>）\x1b[0m'
            done()
          }
        }, COMMAND_TIMEOUT_MS)
      })
    } catch (error) {
      console.error('Failed to execute command:', error)
      throw error
    }
  }

  private async handleCdCommand(session: ContainerSession, targetPath: string): Promise<string> {
    const container = this.docker.getContainer(session.containerId)

    try {
      let newPath: string

      if (targetPath.startsWith('/')) {
        newPath = targetPath
      } else if (targetPath === '~') {
        newPath = '/home/player'
      } else if (targetPath.startsWith('~/')) {
        newPath = '/home/player/' + targetPath.slice(2)
      } else if (targetPath === '..') {
        const parts = session.currentDir.split('/')
        parts.pop()
        newPath = parts.join('/') || '/'
      } else if (targetPath === '.') {
        newPath = session.currentDir
      } else {
        newPath = session.currentDir === '/'
          ? '/' + targetPath
          : session.currentDir + '/' + targetPath
      }

      newPath = this.normalizePath(newPath)

      const exec = await container.exec({
        Cmd: ['test', '-d', newPath],
        AttachStdout: true,
        AttachStderr: true,
      })

      const stream = await exec.start({ Detach: false })
      await new Promise<void>((resolve) => {
        stream.on('end', resolve)
        stream.on('error', resolve)
        stream.on('data', () => {})
      })

      const inspect = await exec.inspect()
      if (inspect.ExitCode !== 0) {
        return `cd: ${targetPath}: No such file or directory`
      }

      session.currentDir = newPath
      console.log(`[CD] Changed directory to: ${newPath}`)
      return ''
    } catch (error) {
      console.error('Failed to change directory:', error)
      return `cd: ${targetPath}: Error`
    }
  }

  private normalizePath(path: string): string {
    const parts = path.split('/').filter(part => part && part !== '.')
    const result: string[] = []

    for (const part of parts) {
      if (part === '..') {
        result.pop()
      } else {
        result.push(part)
      }
    }

    return '/' + result.join('/')
  }

  private async expireIdleSessions(): Promise<void> {
    const cutoff = this.now() - this.idleTimeoutMs
    const sessions = Array.from(this.sessions.values()).filter(session =>
      !session.expired && !session.rebuilding && session.lastActiveAt.getTime() <= cutoff
    )

    await Promise.allSettled(sessions.map(session => this.expireSession(session)))
    this.pruneExpiredSessions()
  }

  private async expireSession(session: ContainerSession): Promise<void> {
    try {
      await this.stopContainerById(session.containerId)
    } catch {
      // Container may already be gone.
    } finally {
      session.expired = true
      session.expiredAt = new Date(this.now())
      console.log(`Session expired due to inactivity: ${session.id}`)
    }
  }

  private async acquireContainer(containerName: string): Promise<Docker.Container> {
    await this.ensureImageExists()

    while (this.pool.length > 0) {
      const container = this.pool.shift()!
      if (await this.isContainerRunning(container)) {
        void this.warmPool()
        return container
      }

      await this.stopContainer(container).catch(() => {})
    }

    return this.createBaseContainer(containerName)
  }

  private async createBaseContainer(containerName: string): Promise<Docker.Container> {
    const container = await this.docker.createContainer({
      name: containerName,
      Image: `${this.imageName}:latest`,
      Tty: true,
      OpenStdin: true,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      User: 'root',
      WorkingDir: '/home/player',
      Env: [
        'TERM=xterm-256color',
        'HOME=/home/player',
      ],
      HostConfig: {
        AutoRemove: true,
        Memory: 128 * 1024 * 1024,
        NanoCpus: 500_000_000,
      },
    })

    await container.start()
    if (!(await this.isContainerRunning(container))) {
      throw new Error(`Container failed to stay running: ${containerName}`)
    }
    return container
  }

  private async runLevelSetup(container: Docker.Container, levelId: number): Promise<void> {
    const setupCommands = this.LEVEL_SETUP_COMMANDS[levelId]
    if (!setupCommands) {
      return
    }

    for (const cmd of setupCommands) {
      const exec = await container.exec({
        Cmd: ['/bin/sh', '-c', cmd],
        AttachStdout: true,
        AttachStderr: true,
        User: 'root',
      })
      const stream = await exec.start({ Detach: false })
      await new Promise<void>((resolve) => {
        stream.on('end', resolve)
        stream.on('error', resolve)
        stream.on('data', () => {})
      })
      console.log(`[Setup] Level ${levelId} setup: ${cmd}`)
    }
  }

  private async ensureImageExists(): Promise<void> {
    if (this.imageEnsured) {
      return
    }

    if (!this.imageEnsurePromise) {
      this.imageEnsurePromise = (async () => {
        const images = await this.docker.listImages()
        const imageExists = images.some(img =>
          img.RepoTags?.includes(`${this.imageName}:latest`)
        )

        if (!imageExists) {
          console.log('Building Docker image...')
          await this.buildImage()
        }

        this.imageEnsured = true
      })().finally(() => {
        this.imageEnsurePromise = undefined
      })
    }

    await this.imageEnsurePromise
  }

  private async buildImage(): Promise<void> {
    const path = process.env.DOCKERFILE_PATH || './docker'
    const stream = await this.docker.buildImage(
      { context: path, src: ['Dockerfile.level'] },
      { t: `${this.imageName}:latest` }
    )

    return new Promise((resolve, reject) => {
      stream.on('data', (data: Buffer) => {
        console.log(data.toString())
      })
      stream.on('end', resolve)
      stream.on('error', reject)
    })
  }

  private assertCapacity(): void {
    if (this.getActiveSessionCount() >= this.maxContainers) {
      throw new ContainerCapacityError()
    }
  }

  private getActiveSessionCount(): number {
    return Array.from(this.sessions.values()).filter(session => !session.expired).length
  }

  private async stopContainerById(containerId: string): Promise<void> {
    const container = this.docker.getContainer(containerId)
    await this.stopContainer(container)
  }

  private async stopContainer(container: Docker.Container): Promise<void> {
    await container.stop({ t: 2 })
  }

  private async isContainerRunning(container: Docker.Container): Promise<boolean> {
    try {
      const info = await container.inspect()
      return !!info.State?.Running
    } catch {
      return false
    }
  }

  private pruneExpiredSessions(): void {
    const cutoff = this.now() - this.expiredSessionRetentionMs

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expired && !session.rebuilding && session.expiredAt && session.expiredAt.getTime() <= cutoff) {
        this.sessions.delete(sessionId)
        console.log(`Expired session pruned from memory: ${sessionId}`)
      }
    }
  }

  private schedulePoolRetry(): void {
    if (this.shuttingDown || this.poolRetryTimer) {
      return
    }

    this.poolRetryTimer = setTimeout(() => {
      this.poolRetryTimer = undefined
      void this.warmPool().catch((error) => {
        console.error('Failed to retry pool warm-up:', error)
      })
    }, 5_000)
  }

  private throwRebuildError(error: unknown): never {
    if (error instanceof ContainerCapacityError) {
      throw error
    }

    if (error instanceof Error && error.message.startsWith('Session not found:')) {
      throw error
    }

    throw new Error('会话已过期，环境重建失败，请稍后重试', { cause: error })
  }

  private stopIdleCheck(): void {
    if (this.idleCheckTimer) {
      clearInterval(this.idleCheckTimer)
      this.idleCheckTimer = undefined
    }
  }

  private clearPoolRetryTimer(): void {
    if (this.poolRetryTimer) {
      clearTimeout(this.poolRetryTimer)
      this.poolRetryTimer = undefined
    }
  }
}
