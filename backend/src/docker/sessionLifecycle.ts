import { v4 as uuidv4 } from 'uuid'
import { acquireContainer, createBaseContainer, ensureImageExists, stopContainer, stopContainerById } from './containerFactory.js'
import { getHistoryOutput } from './history.js'
import { getInitialCurrentDir, getPresetHistory, runLevelSetup } from './levelSetup.js'
import { clearPoolRetryTimer, schedulePoolRetry, stopIdleCheck } from './timers.js'
import type { ContainerManagerState, ContainerSession } from './types.js'

export function assertCapacity(ctx: ContainerManagerState): void {
  const activeSessionCount = Array.from(ctx.sessions.values()).filter((session) => !session.expired).length
  if (activeSessionCount >= ctx.maxContainers) {
    throw new Error('__CAPACITY__')
  }
}

export function throwRebuildError(error: unknown): never {
  if (error instanceof Error && error.message.startsWith('Session not found:')) throw error
  if (error instanceof Error && error.message === '__CAPACITY__') throw error
  throw new Error('会话已过期，环境重建失败，请稍后重试', { cause: error })
}

export async function warmPool(
  ctx: ContainerManagerState,
  createAndStorePoolContainer: () => Promise<void>,
  targetSize = ctx.poolSize,
): Promise<void> {
  if (targetSize <= 0 || ctx.shuttingDown) return
  await ensureImageExists(ctx)
  const missing = Math.max(0, targetSize - (ctx.pool.length + ctx.poolRefillsInFlight))
  await Promise.all(Array.from({ length: missing }, () => createAndStorePoolContainer()))
}

export async function createAndStorePoolContainer(
  ctx: ContainerManagerState,
  warmPoolAgain: () => Promise<void>,
): Promise<void> {
  ctx.poolRefillsInFlight += 1
  try {
    const container = await createBaseContainer(ctx, `linux-learning-pool-${uuidv4().substring(0, 8)}`)
    if (ctx.shuttingDown) {
      await stopContainer(container).catch(() => {})
      return
    }
    ctx.pool.push(container)
    console.log(`Pool replenished. Pool size: ${ctx.pool.length}`)
  } catch (error) {
    console.error('Failed to create pooled container:', error)
    schedulePoolRetry(ctx, warmPoolAgain)
  } finally {
    ctx.poolRefillsInFlight -= 1
  }
}

export async function provisionSession(
  ctx: ContainerManagerState,
  sessionId: string,
  levelId: number,
  refillPool: () => void,
): Promise<ContainerSession> {
  assertCapacity(ctx)
  const container = await acquireContainer(ctx, `linux-learning-${sessionId.substring(0, 8)}`, refillPool)
  try {
    await runLevelSetup(container, levelId)
  } catch (error) {
    await stopContainer(container).catch(() => {})
    throw error
  }

  const now = new Date(ctx.now())
  return {
    id: sessionId,
    containerId: container.id,
    levelId,
    createdAt: now,
    lastActiveAt: now,
    expired: false,
    expiredAt: null,
    rebuilding: false,
    currentDir: getInitialCurrentDir(levelId),
    commandHistory: getPresetHistory(levelId),
  }
}

export async function ensureSessionReady(
  ctx: ContainerManagerState,
  session: ContainerSession,
  rebuildSession: () => Promise<ContainerSession>,
): Promise<boolean> {
  const inFlightRebuild = ctx.rebuildPromises.get(session.id)
  if (inFlightRebuild) {
    try {
      await inFlightRebuild
      return false
    } catch (error) {
      throwRebuildError(error)
    }
  }

  if (!session.expired) return false
  session.rebuilding = true

  const rebuildPromise = (async () => {
    const rebuilt = await rebuildSession()
    if (ctx.shuttingDown || ctx.sessions.get(session.id) !== session) {
      await stopContainerById(ctx, rebuilt.containerId).catch(() => {})
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
    ctx.rebuildPromises.delete(session.id)
  })

  ctx.rebuildPromises.set(session.id, rebuildPromise)
  try {
    await rebuildPromise
    return true
  } catch (error) {
    throwRebuildError(error)
  }
}

export async function expireSession(
  ctx: ContainerManagerState,
  session: ContainerSession,
): Promise<void> {
  try {
    await stopContainerById(ctx, session.containerId)
  } catch {
    // Container may already be gone.
  } finally {
    session.expired = true
    session.expiredAt = new Date(ctx.now())
    console.log(`Session expired due to inactivity: ${session.id}`)
  }
}

export async function expireIdleSessions(
  ctx: ContainerManagerState,
  expireOne: (session: ContainerSession) => Promise<void>,
): Promise<void> {
  const cutoff = ctx.now() - ctx.idleTimeoutMs
  const sessions = Array.from(ctx.sessions.values()).filter((session) =>
    !session.expired && !session.rebuilding && session.lastActiveAt.getTime() <= cutoff,
  )
  await Promise.allSettled(sessions.map((session) => expireOne(session)))
  pruneExpiredSessions(ctx)
}

export function pruneExpiredSessions(ctx: ContainerManagerState): void {
  const cutoff = ctx.now() - ctx.expiredSessionRetentionMs
  for (const [sessionId, session] of ctx.sessions.entries()) {
    if (session.expired && !session.rebuilding && session.expiredAt && session.expiredAt.getTime() <= cutoff) {
      ctx.sessions.delete(sessionId)
      console.log(`Expired session pruned from memory: ${sessionId}`)
    }
  }
}

export async function cleanupSessions(
  ctx: ContainerManagerState,
  destroyContainer: (sessionId: string) => Promise<void>,
): Promise<void> {
  ctx.shuttingDown = true
  stopIdleCheck(ctx)
  await Promise.allSettled(Array.from(ctx.sessions.keys()).map((sessionId) => destroyContainer(sessionId)))
  ctx.sessions.clear()
  const pooledContainers = [...ctx.pool]
  ctx.pool = []
  await Promise.allSettled(pooledContainers.map((container) => stopContainer(container)))
  clearPoolRetryTimer(ctx)
}

export function getSessionHistoryOutput(session: ContainerSession): string {
  return getHistoryOutput(session.commandHistory)
}
