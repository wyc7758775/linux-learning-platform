import type Docker from 'dockerode'

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

export interface ContainerManagerOptions {
  docker?: Pick<Docker, 'listImages' | 'createContainer' | 'getContainer' | 'buildImage'>
  now?: () => number
  idleTimeoutMs?: number
  idleCheckIntervalMs?: number
  expiredSessionRetentionMs?: number
  maxContainers?: number
  poolSize?: number
}

export interface ContainerManagerState {
  docker: Pick<Docker, 'listImages' | 'createContainer' | 'getContainer' | 'buildImage'>
  sessions: Map<string, ContainerSession>
  imageName: string
  now: () => number
  idleTimeoutMs: number
  idleCheckIntervalMs: number
  expiredSessionRetentionMs: number
  maxContainers: number
  poolSize: number
  pool: Docker.Container[]
  poolRefillsInFlight: number
  idleCheckTimer: ReturnType<typeof setInterval> | undefined
  poolRetryTimer: ReturnType<typeof setTimeout> | undefined
  idleCheckInProgress: boolean
  imageEnsured: boolean
  imageEnsurePromise: Promise<void> | undefined
  rebuildPromises: Map<string, Promise<void>>
  shuttingDown: boolean
}
