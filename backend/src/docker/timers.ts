import type { ContainerManagerState } from './types.js'

export function startIdleCheck(
  ctx: ContainerManagerState,
  expireIdleSessions: () => Promise<void>,
): void {
  if (ctx.idleCheckTimer) return
  ctx.idleCheckTimer = setInterval(() => {
    if (ctx.idleCheckInProgress) return
    ctx.idleCheckInProgress = true
    void expireIdleSessions().finally(() => {
      ctx.idleCheckInProgress = false
    })
  }, ctx.idleCheckIntervalMs)
}

export function stopIdleCheck(ctx: ContainerManagerState): void {
  if (!ctx.idleCheckTimer) return
  clearInterval(ctx.idleCheckTimer)
  ctx.idleCheckTimer = undefined
}

export function clearPoolRetryTimer(ctx: ContainerManagerState): void {
  if (!ctx.poolRetryTimer) return
  clearTimeout(ctx.poolRetryTimer)
  ctx.poolRetryTimer = undefined
}

export function schedulePoolRetry(
  ctx: ContainerManagerState,
  warmPool: () => Promise<void>,
): void {
  if (ctx.shuttingDown || ctx.poolRetryTimer) return
  ctx.poolRetryTimer = setTimeout(() => {
    ctx.poolRetryTimer = undefined
    void warmPool().catch((error) => console.error('Failed to retry pool warm-up:', error))
  }, 5_000)
}
