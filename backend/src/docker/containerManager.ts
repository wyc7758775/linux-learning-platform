import Docker from 'dockerode'
import { v4 as uuidv4 } from 'uuid'

export interface ContainerSession {
  id: string
  containerId: string
  levelId: number
  createdAt: Date
  currentDir: string
  commandHistory: string[]  // Track command history
}

export class ContainerManager {
  private docker: Docker
  private sessions: Map<string, ContainerSession> = new Map()
  private imageName = 'linux-learning-level'

  // Commands that require elevated privileges (sudo)
  private readonly PRIVILEGED_COMMANDS = [
    'adduser', 'useradd', 'userdel', 'usermod',
    'groupadd', 'groupdel', 'groupmod',
    'passwd', 'chown', 'chgrp',
  ]

  // Setup commands to run as root before handing control to player
  // Each level may need a pre-configured environment
  private readonly LEVEL_SETUP_COMMANDS: Record<number, string[]> = {
    // Level 7: alice must already exist so player can add her to developers group
    7: ['adduser -D alice'],
    // Level 9: alice must exist for chown :developers to work
    9: ['adduser -D alice'],
    // Level 12: alice must exist
    12: ['adduser -D alice'],
    // Level 13: start a CPU-intensive background process named stress-worker
    13: ['/usr/local/bin/stress-worker > /dev/null 2>&1 &'],
    // Level 15: occupy port 8080 with nc
    15: ['nc -l -p 8080 > /dev/null 2>&1 &'],
  }

  constructor() {
    this.docker = new Docker()
  }

  async createContainer(levelId: number): Promise<ContainerSession> {
    const sessionId = uuidv4()
    const containerName = `linux-learning-${sessionId.substring(0, 8)}`

    try {
      // Check if image exists, if not build it
      const images = await this.docker.listImages()
      const imageExists = images.some(img =>
        img.RepoTags?.includes(`${this.imageName}:latest`)
      )

      if (!imageExists) {
        console.log('Building Docker image...')
        await this.buildImage()
      }

      // Create container
      const container = await this.docker.createContainer({
        name: containerName,
        Image: `${this.imageName}:latest`,
        Tty: true,
        OpenStdin: true,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        User: 'root',  // 以 root 运行，允许执行 adduser/groupadd 等命令
        WorkingDir: '/home/player',
        Env: [
          'TERM=xterm-256color',
          'HOME=/home/player',
        ],
        HostConfig: {
          AutoRemove: true,
          Memory: 128 * 1024 * 1024, // 128MB limit
          CpuShares: 512, // Lower CPU priority
        },
      })

      await container.start()

      // Run level-specific setup commands as root
      const setupCommands = this.LEVEL_SETUP_COMMANDS[levelId]
      if (setupCommands) {
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

      const session: ContainerSession = {
        id: sessionId,
        containerId: container.id,
        levelId,
        createdAt: new Date(),
        currentDir: '/home/player',
        commandHistory: [],
      }

      this.sessions.set(sessionId, session)
      console.log(`Container created: ${containerName} for level ${levelId}`)

      return session
    } catch (error) {
      console.error('Failed to create container:', error)
      throw error
    }
  }

  async executeCommand(sessionId: string, command: string): Promise<{ output: string; currentDir: string }> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      console.error(`Session not found: ${sessionId}. Available sessions:`, Array.from(this.sessions.keys()))
      throw new Error(`Session not found: ${sessionId}`)
    }

    // Save command to history (unless it's the history command itself)
    if (command.trim() !== 'history') {
      session.commandHistory.push(command.trim())
    }

    // Handle history command specially
    if (command.trim() === 'history') {
      return { output: this.getHistoryOutput(session), currentDir: session.currentDir }
    }

    const output = await this.executeInContainer(session, command)
    return { output, currentDir: session.currentDir }
  }

  private getHistoryOutput(session: ContainerSession): string {
    if (session.commandHistory.length === 0) {
      return ''
    }
    // Format like bash history: line numbers with commands
    // Use \r\n to ensure each line starts at the beginning of the line (carriage return + newline)
    return '\r\n' + session.commandHistory
      .map((cmd, index) => `    ${index + 1}  ${cmd}`)
      .join('\r\n')
  }

  private elevatePrivilegedCommands(command: string): string {
    // Split compound command by &&, ||, ; while preserving the separators
    const parts = command.split(/(&&|\|\||;)/)
    const elevated = parts.map((part, i) => {
      // Odd-indexed parts are the separators (&&, ||, ;)
      if (i % 2 === 1) return part
      const trimmed = part.trim()
      const needsSudo = this.PRIVILEGED_COMMANDS.some(cmd =>
        trimmed.startsWith(cmd + ' ') || trimmed === cmd
      )
      if (needsSudo) {
        // Replace leading whitespace + command with sudo version
        return part.replace(trimmed, `/usr/bin/sudo ${trimmed}`)
      }
      return part
    })
    return elevated.join('')
  }

  private async executeInContainer(session: ContainerSession, command: string): Promise<string> {
    const container = this.docker.getContainer(session.containerId)

    try {
      // Handle cd command specially to track current directory
      const cdMatch = command.match(/^cd\s+(.+)$/)
      if (cdMatch) {
        return this.handleCdCommand(session, cdMatch[1])
      }

      // Elevate privileged sub-commands within compound commands (&&, ||, ;)
      const elevatedCommand = this.elevatePrivilegedCommands(command)

      // Build the full command with cd prefix to maintain directory context
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

        const done = () => {
          if (!resolved) {
            resolved = true
            console.log(`[Exec] Output:`, JSON.stringify(output))
            resolve(output)
          }
        }

        stream.on('data', (chunk: Buffer) => {
          output += chunk.toString()
        })

        stream.on('end', done)
        stream.on('error', reject)

        // Fallback: poll exec status in case TTY stream end event doesn't fire
        const poll = setInterval(async () => {
          try {
            const info = await exec.inspect()
            if (!info.Running) {
              clearInterval(poll)
              done()
            }
          } catch {
            clearInterval(poll)
            done()
          }
        }, 200)
      })
    } catch (error) {
      console.error('Failed to execute command:', error)
      throw error
    }
  }

  private async handleCdCommand(session: ContainerSession, targetPath: string): Promise<string> {
    const container = this.docker.getContainer(session.containerId)

    try {
      // Resolve the target path
      let newPath: string

      if (targetPath.startsWith('/')) {
        // Absolute path
        newPath = targetPath
      } else if (targetPath === '~') {
        newPath = '/home/player'
      } else if (targetPath.startsWith('~/')) {
        newPath = '/home/player/' + targetPath.slice(2)
      } else if (targetPath === '..') {
        // Go up one directory
        const parts = session.currentDir.split('/')
        parts.pop()
        newPath = parts.join('/') || '/'
      } else if (targetPath === '.') {
        newPath = session.currentDir
      } else {
        // Relative path
        newPath = session.currentDir === '/'
          ? '/' + targetPath
          : session.currentDir + '/' + targetPath
      }

      // Normalize path (remove . and ..)
      newPath = this.normalizePath(newPath)

      // Check if directory exists
      const exec = await container.exec({
        Cmd: ['test', '-d', newPath],
        AttachStdout: true,
        AttachStderr: true,
      })

      const stream = await exec.start({ Detach: false })

      // Wait for the command to complete
      await new Promise<void>((resolve) => {
        stream.on('end', resolve)
        stream.on('error', resolve)
        // Also consume any data to prevent buffer issues
        stream.on('data', () => {})
      })

      const inspect = await exec.inspect()

      if (inspect.ExitCode !== 0) {
        return `cd: ${targetPath}: No such file or directory`
      }

      // Update session's current directory
      session.currentDir = newPath
      console.log(`[CD] Changed directory to: ${newPath}`)

      // cd command produces no output on success
      return ''
    } catch (error) {
      console.error('Failed to change directory:', error)
      return `cd: ${targetPath}: Error`
    }
  }

  private normalizePath(path: string): string {
    const parts = path.split('/').filter(p => p && p !== '.')
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

  async destroyContainer(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return
    }

    try {
      const container = this.docker.getContainer(session.containerId)
      await container.stop({ t: 2 })
      this.sessions.delete(sessionId)
    } catch (error) {
      // Container might already be stopped or removed
      this.sessions.delete(sessionId)
    }
  }

  async checkFileExists(sessionId: string, filePath: string): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return false
    }

    const container = this.docker.getContainer(session.containerId)

    try {
      // Resolve path relative to current directory if not absolute
      const fullPath = filePath.startsWith('/')
        ? filePath
        : session.currentDir + '/' + filePath

      const exec = await container.exec({
        Cmd: ['test', '-f', this.normalizePath(fullPath)],
        AttachStdout: true,
        AttachStderr: true,
      })

      await exec.start({ Detach: false })
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
      // Resolve path relative to current directory if not absolute
      const fullPath = dirPath.startsWith('/')
        ? dirPath
        : session.currentDir + '/' + dirPath

      const exec = await container.exec({
        Cmd: ['test', '-d', this.normalizePath(fullPath)],
        AttachStdout: true,
        AttachStderr: true,
      })

      await exec.start({ Detach: false })
      const inspect = await exec.inspect()
      return inspect.ExitCode === 0
    } catch {
      return false
    }
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

  async cleanup(): Promise<void> {
    const destroyPromises = Array.from(this.sessions.keys()).map(sessionId =>
      this.destroyContainer(sessionId)
    )
    await Promise.all(destroyPromises)
  }

  /**
   * 获取文件或目录的权限（八进制格式，如 "644"）
   */
  async getFilePermission(sessionId: string, filePath: string): Promise<string> {
    const result = await this.executeCommand(sessionId, `stat -c '%a' ${filePath}`)
    return result.output.trim()
  }

  /**
   * 获取文件或目录的属组
   */
  async getFileGroup(sessionId: string, filePath: string): Promise<string> {
    const result = await this.executeCommand(sessionId, `stat -c '%G' ${filePath}`)
    return result.output.trim()
  }

  /**
   * 检查是否存在指定权限的文件（在 /home/player 目录下）
   */
  async checkPermissionExists(sessionId: string, permission: string): Promise<boolean> {
    const result = await this.executeCommand(
      sessionId,
      `find /home/player -maxdepth 1 -type f -perm ${permission} 2>/dev/null | head -1`
    )
    return result.output.trim().length > 0
  }

  /**
   * 检查用户是否存在
   */
  async checkUserExists(sessionId: string, username: string): Promise<boolean> {
    const result = await this.executeCommand(sessionId, `id ${username} 2>/dev/null`)
    return result.output.includes(`uid=`)
  }

  /**
   * 检查用户是否在指定组中
   */
  async checkUserInGroup(sessionId: string, username: string, groupname: string): Promise<boolean> {
    // 使用 groups 命令检查用户所属组
    const result = await this.executeCommand(sessionId, `groups ${username} 2>/dev/null`)
    console.log(`[checkUserInGroup] groups output: ${JSON.stringify(result.output)}, checking for: ${groupname}`)
    return result.output.includes(groupname)
  }
}
