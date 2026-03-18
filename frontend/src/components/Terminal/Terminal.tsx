import { useEffect, useRef, useCallback } from 'react'
import { Terminal as XTerminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { socket } from '../../services/socket'

interface TerminalProps {
  sessionId: string
  levelId: number
}

// Format directory path for display (like bash prompt)
function formatDir(dir: string): string {
  const home = '/home/player'
  if (dir === home) return '~'
  if (dir.startsWith(home + '/')) return '~' + dir.slice(home.length)
  return dir
}

// Generate prompt string
function generatePrompt(currentDir: string): string {
  const dirDisplay = formatDir(currentDir)
  return `\x1b[1;34mplayer@linux\x1b[0m:\x1b[1;36m${dirDisplay}\x1b[0m$ `
}

export function Terminal({ sessionId, levelId }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const inputBufferRef = useRef<string>('')
  const sessionIdRef = useRef<string>(sessionId)
  const currentDirRef = useRef<string>('/home/player')

  // Keep sessionIdRef in sync with sessionId prop
  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  const handleResize = useCallback(() => {
    if (fitAddonRef.current && xtermRef.current) {
      fitAddonRef.current.fit()
    }
  }, [])

  useEffect(() => {
    if (!terminalRef.current) return

    // Create terminal
    const xterm = new XTerminal({
      theme: {
        background: '#1a1a2e',
        foreground: '#00ff41',
        cursor: '#00ff41',
        cursorAccent: '#1a1a2e',
        green: '#00ff41',
      },
      fontFamily: 'Menlo, Monaco, Courier New, monospace',
      fontSize: 14,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'block',
    })

    const fitAddon = new FitAddon()
    xterm.loadAddon(fitAddon)

    xterm.open(terminalRef.current)
    fitAddon.fit()

    xtermRef.current = xterm
    fitAddonRef.current = fitAddon

    // Handle resize
    window.addEventListener('resize', handleResize)

    // Welcome message
    xterm.writeln('\x1b[1;32m欢迎来到 Linux 学习终端!\x1b[0m')
    xterm.writeln('\x1b[90m输入命令开始学习...\x1b[0m')
    xterm.writeln('')
    xterm.write(generatePrompt(currentDirRef.current))

    // Handle terminal input
    xterm.onData((data) => {
      const code = data.charCodeAt(0)

      if (code === 13) { // Enter
        const command = inputBufferRef.current.trim()
        xterm.writeln('')

        if (command) {
          // Send command to server - use sessionIdRef to get current sessionId
          const currentSessionId = sessionIdRef.current
          if (currentSessionId) {
            socket.emit('terminal:input', {
              sessionId: currentSessionId,
              command,
              levelId
            })
          } else {
            xterm.writeln('\x1b[31m错误: 未连接到会话\x1b[0m')
            xterm.write(generatePrompt(currentDirRef.current))
          }
        } else {
          xterm.write(generatePrompt(currentDirRef.current))
        }

        inputBufferRef.current = ''
      } else if (code === 127) { // Backspace
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1)
          xterm.write('\b \b')
        }
      } else if (code === 27) { // Escape sequences (arrow keys, etc.)
        if (data === '\x1b[A') { // Up arrow - could implement history
          // TODO: command history
        } else if (data === '\x1b[B') { // Down arrow
          // TODO: command history
        }
      } else if (code >= 32) { // Printable characters
        inputBufferRef.current += data
        xterm.write(data)
      }
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      xterm.dispose()
    }
  }, [])

  // Handle session changes
  useEffect(() => {
    if (xtermRef.current && sessionId) {
      xtermRef.current.clear()
      currentDirRef.current = '/home/player' // Reset directory on new session
      xtermRef.current.writeln('\x1b[1;32m会话已创建，开始关卡 ' + levelId + '\x1b[0m')
      xtermRef.current.writeln('')
      xtermRef.current.write(generatePrompt(currentDirRef.current))
    }
  }, [sessionId, levelId])

  // Handle terminal output from server
  useEffect(() => {
    const handleOutput = (data: { output: string; currentDir?: string }) => {
      if (xtermRef.current) {
        // Update current directory if provided
        if (data.currentDir) {
          currentDirRef.current = data.currentDir
        }

        // Write output
        if (data.output) {
          xtermRef.current.write(data.output)
        }

        // Write new prompt with current directory
        xtermRef.current.write('\r\n' + generatePrompt(currentDirRef.current))
      }
    }

    socket.on('terminal:output', handleOutput)

    return () => {
      socket.off('terminal:output', handleOutput)
    }
  }, [])

  return (
    <div
      ref={terminalRef}
      className="flex-1 w-full p-2 min-h-0"
      style={{ backgroundColor: '#1a1a2e' }}
    />
  )
}
