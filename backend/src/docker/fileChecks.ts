import type { ContainerManagerState } from './types.js'
import { normalizePath, resolveSessionPath } from './pathUtils.js'

export async function checkFileExists(
  ctx: ContainerManagerState,
  sessionId: string,
  filePath: string,
): Promise<boolean> {
  return runPathTest(ctx, sessionId, filePath, '-f')
}

export async function checkDirectoryExists(
  ctx: ContainerManagerState,
  sessionId: string,
  dirPath: string,
): Promise<boolean> {
  return runPathTest(ctx, sessionId, dirPath, '-d')
}

export async function getFileContent(
  executeCommand: (sessionId: string, command: string) => Promise<{ output: string }>,
  sessionId: string,
  filePath: string,
): Promise<string> {
  return (await executeCommand(sessionId, `cat ${filePath}`)).output
}

export async function getFilePermission(
  executeCommand: (sessionId: string, command: string) => Promise<{ output: string }>,
  sessionId: string,
  filePath: string,
): Promise<string> {
  return (await executeCommand(sessionId, `stat -c '%a' ${filePath}`)).output.trim()
}

export async function getFileGroup(
  executeCommand: (sessionId: string, command: string) => Promise<{ output: string }>,
  sessionId: string,
  filePath: string,
): Promise<string> {
  return (await executeCommand(sessionId, `stat -c '%G' ${filePath}`)).output.trim()
}

export async function checkPermissionExists(
  executeCommand: (sessionId: string, command: string) => Promise<{ output: string }>,
  sessionId: string,
  permission: string,
): Promise<boolean> {
  const result = await executeCommand(
    sessionId,
    `find /home/player -maxdepth 1 -type f -perm ${permission} 2>/dev/null | head -1`,
  )
  return result.output.trim().length > 0
}

export async function checkUserExists(
  executeCommand: (sessionId: string, command: string) => Promise<{ output: string }>,
  sessionId: string,
  username: string,
): Promise<boolean> {
  return (await executeCommand(sessionId, `id ${username} 2>/dev/null`)).output.includes('uid=')
}

export async function checkUserInGroup(
  executeCommand: (sessionId: string, command: string) => Promise<{ output: string }>,
  sessionId: string,
  username: string,
  groupname: string,
): Promise<boolean> {
  const result = await executeCommand(sessionId, `groups ${username} 2>/dev/null`)
  console.log(`[checkUserInGroup] groups output: ${JSON.stringify(result.output)}, checking for: ${groupname}`)
  return result.output.includes(groupname)
}

async function runPathTest(
  ctx: ContainerManagerState,
  sessionId: string,
  targetPath: string,
  typeFlag: '-f' | '-d',
): Promise<boolean> {
  const session = ctx.sessions.get(sessionId)
  if (!session) return false

  try {
    const fullPath = resolveSessionPath(session.currentDir, targetPath)
    const exec = await ctx.docker.getContainer(session.containerId).exec({
      Cmd: ['test', typeFlag, normalizePath(fullPath)],
      AttachStdout: true,
      AttachStderr: true,
    })
    const stream = await exec.start({ Detach: false })
    await new Promise<void>((resolve) => {
      stream.on('data', () => {})
      stream.on('end', resolve)
      stream.on('error', resolve)
    })
    return (await exec.inspect()).ExitCode === 0
  } catch {
    return false
  }
}
