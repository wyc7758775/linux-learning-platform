import Docker from 'dockerode'
import { v4 as uuidv4 } from 'uuid'
import { executeInContainer } from './commandPolicy.js'
import { checkDirectoryExists, checkFileExists, checkPermissionExists, checkUserExists, checkUserInGroup, getFileContent, getFileGroup, getFilePermission } from './fileChecks.js'
import { cleanupSessions, createAndStorePoolContainer, ensureSessionReady, expireIdleSessions, expireSession, getSessionHistoryOutput, provisionSession, warmPool } from './sessionLifecycle.js'
import { stopContainer, stopContainerById } from './containerFactory.js'
import { startIdleCheck, stopIdleCheck } from './timers.js'
import type { ContainerManagerOptions, ContainerManagerState, ContainerSession, ExecuteCommandResult } from './types.js'

export type { ContainerSession, ExecuteCommandResult } from './types.js'

export class ContainerCapacityError extends Error {
  constructor(message = '当前资源不足，请稍后再试') {
    super(message)
    this.name = 'ContainerCapacityError'
  }
}

export class ContainerManager {
  private readonly docker; private readonly sessions = new Map<string, ContainerSession>(); private readonly imageName = process.env.LEVEL_IMAGE_NAME || 'linux-learning-level'; private readonly now; private readonly idleTimeoutMs; private readonly idleCheckIntervalMs; private readonly expiredSessionRetentionMs; private readonly maxContainers; private readonly poolSize
  private pool: Docker.Container[] = []; private poolRefillsInFlight = 0; private idleCheckTimer: ReturnType<typeof setInterval> | undefined; private poolRetryTimer: ReturnType<typeof setTimeout> | undefined; private idleCheckInProgress = false; private imageEnsured = false; private imageEnsurePromise: Promise<void> | undefined; private readonly rebuildPromises = new Map<string, Promise<void>>(); private shuttingDown = false

  constructor(options: ContainerManagerOptions = {}) {
    this.docker = options.docker ?? new Docker()
    this.now = options.now ?? Date.now
    this.idleTimeoutMs = options.idleTimeoutMs ?? 30 * 60 * 1000
    this.idleCheckIntervalMs = options.idleCheckIntervalMs ?? 60 * 1000
    this.expiredSessionRetentionMs = options.expiredSessionRetentionMs ?? 2 * 60 * 60 * 1000
    this.maxContainers = options.maxContainers ?? 20
    this.poolSize = options.poolSize ?? 3
  }

  async initialize(): Promise<void> { this.shuttingDown = false; this.startIdleCheck(); await this.warmPool() }
  startIdleCheck(): void { startIdleCheck(this.state, () => this.expireIdleSessions()) }
  async warmPool(targetSize = this.poolSize): Promise<void> { await warmPool(this.state, () => this.createAndStorePoolContainer(), targetSize) }
  async createContainer(levelId: number): Promise<ContainerSession> { if (this.shuttingDown) throw new Error('服务正在关闭，暂时无法创建容器'); const sessionId = uuidv4(); const session = await this.provisionSession(sessionId, levelId); this.sessions.set(sessionId, session); console.log(`Container created for session ${sessionId} (level ${levelId})`); return session }

  async executeCommand(sessionId: string, command: string): Promise<ExecuteCommandResult> {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error(`Session not found: ${sessionId}`)
    const reconnected = await this.ensureSessionReady(session)
    session.lastActiveAt = new Date(this.now())
    if (command.trim() !== 'history') session.commandHistory.push(command.trim())
    if (command.trim() === 'history') return { output: getSessionHistoryOutput(session), currentDir: session.currentDir, reconnected }
    return { output: await executeInContainer(this.state, session, command), currentDir: session.currentDir, reconnected }
  }

  getCommandHistory(sessionId: string): string[] { return this.sessions.get(sessionId) ? [...this.sessions.get(sessionId)!.commandHistory] : [] }
  async destroyContainer(sessionId: string): Promise<void> { const session = this.sessions.get(sessionId); if (!session) return; this.sessions.delete(sessionId); try { await stopContainerById(this.state, session.containerId) } catch {} }
  async cleanup(): Promise<void> { await cleanupSessions(this.state, (sessionId) => this.destroyContainer(sessionId)) }
  async checkFileExists(sessionId: string, filePath: string): Promise<boolean> { return checkFileExists(this.state, sessionId, filePath) }
  async getFileContent(sessionId: string, filePath: string): Promise<string> { return getFileContent((sid, command) => this.executeCommand(sid, command), sessionId, filePath) }
  async checkDirectoryExists(sessionId: string, dirPath: string): Promise<boolean> { return checkDirectoryExists(this.state, sessionId, dirPath) }
  async getFilePermission(sessionId: string, filePath: string): Promise<string> { return getFilePermission((sid, command) => this.executeCommand(sid, command), sessionId, filePath) }
  async getFileGroup(sessionId: string, filePath: string): Promise<string> { return getFileGroup((sid, command) => this.executeCommand(sid, command), sessionId, filePath) }
  async checkPermissionExists(sessionId: string, permission: string): Promise<boolean> { return checkPermissionExists((sid, command) => this.executeCommand(sid, command), sessionId, permission) }
  async checkUserExists(sessionId: string, username: string): Promise<boolean> { return checkUserExists((sid, command) => this.executeCommand(sid, command), sessionId, username) }
  async checkUserInGroup(sessionId: string, username: string, groupname: string): Promise<boolean> { return checkUserInGroup((sid, command) => this.executeCommand(sid, command), sessionId, username, groupname) }
  private async createAndStorePoolContainer(): Promise<void> { await createAndStorePoolContainer(this.state, () => this.warmPool()) }
  private async ensureSessionReady(session: ContainerSession): Promise<boolean> { return ensureSessionReady(this.state, session, () => this.provisionSession(session.id, session.levelId)) }
  private async provisionSession(sessionId: string, levelId: number): Promise<ContainerSession> { try { return await provisionSession(this.state, sessionId, levelId, () => { void this.warmPool() }) } catch (error) { if (error instanceof Error && error.message === '__CAPACITY__') throw new ContainerCapacityError(); throw error } }
  private async expireIdleSessions(): Promise<void> { await expireIdleSessions(this.state, (session) => this.expireSession(session)) }
  private async expireSession(session: ContainerSession): Promise<void> { await expireSession(this.state, session) }
  private stopIdleCheck(): void { stopIdleCheck(this.state) }
  private get state(): ContainerManagerState { return this as unknown as ContainerManagerState }
}
