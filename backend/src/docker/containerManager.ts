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
  private imageName = process.env.LEVEL_IMAGE_NAME || 'linux-learning-level'

  // Commands that require elevated privileges (sudo)
  private readonly PRIVILEGED_COMMANDS = [
    'adduser', 'useradd', 'userdel', 'usermod',
    'groupadd', 'groupdel', 'groupmod',
    'passwd', 'chown', 'chgrp',
    'nginx', 'systemctl', 'service',
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
    // Level 21-23: create pre-built dist directory for deployment levels
    21: ['mkdir -p /home/player/my-app/dist && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><div id=\\"app\\"></div><script src=\\"/assets/index.js\\"></script></body></html>" > /home/player/my-app/dist/index.html && echo "console.log(\\"Hello Vue!\\")" > /home/player/my-app/dist/assets/index.js && chown -R player:player /home/player/my-app/dist'],
    22: ['mkdir -p /home/player/my-app/dist && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><div id=\\"app\\"></div><script src=\\"/assets/index.js\\"></script></body></html>" > /home/player/my-app/dist/index.html && echo "console.log(\\"Hello Vue!\\")" > /home/player/my-app/dist/assets/index.js && chown -R player:player /home/player/my-app/dist'],
    23: ['mkdir -p /home/player/my-app/dist && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><div id=\\"app\\"></div><script src=\\"/assets/index.js\\"></script></body></html>" > /home/player/my-app/dist/index.html && echo "console.log(\\"Hello Vue!\\")" > /home/player/my-app/dist/assets/index.js && chown -R player:player /home/player/my-app/dist'],
    // Level 24: start nginx and serve static HTML
    24: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><h1>Hello Nginx!</h1></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    // Level 25: give player write access to nginx config dir
    25: ['chown -R player:player /etc/nginx/http.d'],
    // Level 27-30: start nginx for testing
    27: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><h1>Hello Nginx!</h1></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html'],
    28: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><h1>Hello Nginx!</h1></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html'],
    29: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>My App</title></head><body><h1>Hello Nginx!</h1></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html'],
    // Level 30: start mock API server + configure nginx as reverse proxy
    30: ['rm -f /etc/nginx/http.d/default.conf && /usr/local/bin/mock-api > /dev/null 2>&1 & sleep 1 && echo "server { listen 80 default_server; location / { proxy_pass http://127.0.0.1:3000; } }" > /etc/nginx/http.d/myapp.conf'],
    // Level 34: make crontab accessible for player (set suid bit)
    34: ['chmod u+s /usr/bin/crontab'],
    // Level 35: give player write access to logrotate config dir
    35: ['chown -R player:player /etc/logrotate.d'],
    // Level 45: create a test file for safe_rm.sh exercise
    45: ['echo "important data" > /home/player/testfile.tmp && chown player:player /home/player/testfile.tmp'],
    // Level 52-55, 57, 59: start nginx for network troubleshooting levels
    52: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    53: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    54: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    55: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    57: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    59: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html && nginx'],
    // Level 60: nginx NOT started (troubleshooting scenario), but HTML page ready
    60: ['mkdir -p /var/www/html && echo "<!DOCTYPE html><html><head><title>Network Lab</title></head><body><h1>Welcome</h1><p>Server is running</p></body></html>" > /var/www/html/index.html && chown -R player:player /var/www/html'],
  }

  private readonly LEVEL_PRESET_HISTORY: Record<number, string[]> = {
    5: ['ls', 'pwd', 'clear'],
  }

  private getInitialCurrentDir(levelId: number): string {
    return levelId === 3 ? '/tmp' : '/home/player'
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
          NanoCpus: 500_000_000, // 0.5 CPU cores max
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

      const initialCurrentDir = this.getInitialCurrentDir(levelId)

      const session: ContainerSession = {
        id: sessionId,
        containerId: container.id,
        levelId,
        createdAt: new Date(),
        currentDir: initialCurrentDir,
        commandHistory: [...(this.LEVEL_PRESET_HISTORY[levelId] || [])],
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
        let processed = trimmed
        // Alpine's adduser is interactive by default; add -D flag if missing
        const adduserMatch = processed.match(/^(adduser)\s+(?!.*-D)(.*)$/)
        if (adduserMatch) {
          processed = `adduser -D ${adduserMatch[2]}`
        }
        if (/^groupadd(\s|$)/.test(processed) && !processed.includes('|| true')) {
          processed = `${processed} 2>/dev/null || true`
        }
        // Replace leading whitespace + command with sudo version
        return part.replace(trimmed, `/usr/bin/sudo ${processed}`)
      }
      return part
    })
    const result = elevated.join('')
    // Post-process: make groupadd tolerant of existing groups
    // Replace "sudo groupadd X &&" with "sudo groupadd X 2>/dev/null; " so the chain continues
    return result.replace(/(sudo groupadd \S+)\s*&&/g, '$1 2>/dev/null; ')
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
        const COMMAND_TIMEOUT_MS = 10_000 // 10 seconds timeout for any command
        let poll: ReturnType<typeof setInterval> | undefined
        let timeoutHandle: ReturnType<typeof setTimeout> | undefined

        const done = () => {
          if (!resolved) {
            resolved = true
            if (poll) clearInterval(poll)
            if (timeoutHandle) clearTimeout(timeoutHandle)
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

        // Timeout: prevent interactive commands from hanging forever
        timeoutHandle = setTimeout(async () => {
          if (!resolved) {
            console.log(`[Exec] Command timed out after ${COMMAND_TIMEOUT_MS}ms: ${fullCommand}`)
            try {
              // Try to kill the hanging process
              const killExec = await container.exec({
                Cmd: ['/bin/sh', '-c', `pkill -f "${elevatedCommand.replace(/"/g, '\\"')}" 2>/dev/null || true`],
                AttachStdout: true,
                AttachStderr: true,
                User: 'root',
              })
              await killExec.start({ Detach: false })
            } catch {
              // Ignore kill errors
            }
            output += `\r\n\x1b[33m⚠ 命令执行超时。此命令可能需要交互输入，请尝试非交互方式（如 adduser -D <用户名>）\x1b[0m`
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
