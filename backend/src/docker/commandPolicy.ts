import type { ContainerManagerState, ContainerSession } from './types.js'
import { PRIVILEGED_COMMANDS } from './constants.js'
import { normalizePath, resolveCdTargetPath } from './pathUtils.js'

export function elevatePrivilegedCommands(command: string): string {
  const parts = command.split(/(&&|\|\||;)/)
  const elevated = parts.map((part, index) => {
    if (index % 2 === 1) return part
    const trimmed = part.trim()
    const needsSudo = PRIVILEGED_COMMANDS.some((item) =>
      trimmed.startsWith(`${item} `) || trimmed === item,
    )
    if (!needsSudo) return part

    let processed = trimmed
    const adduserMatch = processed.match(/^(adduser)\s+(?!.*-D)(.*)$/)
    if (adduserMatch) processed = `adduser -D ${adduserMatch[2]}`
    if (/^groupadd(\s|$)/.test(processed) && !processed.includes('|| true')) {
      processed = `${processed} 2>/dev/null || true`
    }

    return part.replace(trimmed, `/usr/bin/sudo ${processed}`)
  })

  return elevated.join('').replace(/(sudo groupadd \S+)\s*&&/g, '$1 2>/dev/null; ')
}

export async function executeInContainer(
  ctx: ContainerManagerState,
  session: ContainerSession,
  command: string,
): Promise<string> {
  const cdMatch = command.match(/^cd\s+(.+)$/)
  if (cdMatch) {
    return handleCdCommand(ctx, session, cdMatch[1])
  }

  const container = ctx.docker.getContainer(session.containerId)
  const elevatedCommand = elevatePrivilegedCommands(command)
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
    const commandTimeoutMs = 10_000
    let poll: ReturnType<typeof setInterval> | undefined
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined

    const done = () => {
      if (resolved) return
      resolved = true
      if (poll) clearInterval(poll)
      if (timeoutHandle) clearTimeout(timeoutHandle)
      console.log('[Exec] Output:', JSON.stringify(output))
      resolve(output)
    }

    stream.on('data', (chunk: Buffer) => { output += chunk.toString() })
    stream.on('end', done)
    stream.on('error', reject)

    poll = setInterval(async () => {
      try {
        if (!(await exec.inspect()).Running) done()
      } catch {
        done()
      }
    }, 200)

    timeoutHandle = setTimeout(async () => {
      if (resolved) return
      console.log(`[Exec] Command timed out after ${commandTimeoutMs}ms: ${fullCommand}`)
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
    }, commandTimeoutMs)
  })
}

async function handleCdCommand(
  ctx: ContainerManagerState,
  session: ContainerSession,
  targetPath: string,
): Promise<string> {
  const newPath = resolveCdTargetPath(session.currentDir, targetPath)
  const exec = await ctx.docker.getContainer(session.containerId).exec({
    Cmd: ['test', '-d', normalizePath(newPath)],
    AttachStdout: true,
    AttachStderr: true,
  })
  const stream = await exec.start({ Detach: false })
  await new Promise<void>((resolve) => {
    stream.on('end', resolve)
    stream.on('error', resolve)
    stream.on('data', () => {})
  })

  if ((await exec.inspect()).ExitCode !== 0) {
    return `cd: ${targetPath}: No such file or directory`
  }

  session.currentDir = newPath
  console.log(`[CD] Changed directory to: ${newPath}`)
  return ''
}
