import { useEffect, useRef, useCallback } from 'react'
import { Terminal as XTerminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { socket } from '../../services/socket'
import { useTheme } from '../../contexts/ThemeContext'
import { formatDir, HOME_DIR } from '../../utils/terminal'

interface TerminalProps {
  sessionId: string
  levelId: number
  initialDir: string
  onDirectoryChange?: (dir: string) => void
  onCommandResult?: (command: string, output: string, completed: boolean) => void
}

function generatePrompt(currentDir: string): string {
  const dirDisplay = formatDir(currentDir)
  return `\x1b[1;34mplayer@linux\x1b[0m:\x1b[1;36m${dirDisplay}\x1b[0m$ `
}

export function Terminal({
  sessionId,
  levelId,
  initialDir,
  onDirectoryChange,
  onCommandResult,
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const inputBufferRef = useRef<string>('')
  const lastCommandRef = useRef<string>('')
  const sessionIdRef = useRef<string>(sessionId)
  const levelIdRef = useRef<number>(levelId)
  const currentDirRef = useRef<string>(initialDir || HOME_DIR)
  const { isDark } = useTheme()

  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  useEffect(() => {
    levelIdRef.current = levelId
  }, [levelId])

  const fitTerminal = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (fitAddonRef.current && xtermRef.current) {
        fitAddonRef.current.fit()
      }
    })
  }, [])

  const handleResize = useCallback(() => {
    if (fitAddonRef.current && xtermRef.current) {
      fitTerminal()
    }
  }, [fitTerminal])

  useEffect(() => {
    if (!terminalRef.current) return

    const xterm = new XTerminal({
      theme: isDark ? {
        background: '#0f172a',
        foreground: '#94a3b8',
        cursor: '#22c55e',
        cursorAccent: '#0f172a',
        selectionBackground: '#22c55e33',
        selectionForeground: '#ffffff',
        black: '#0f172a',
        red: '#f87171',
        green: '#22c55e',
        yellow: '#fbbf24',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#f8fafc',
        brightBlack: '#475569',
        brightRed: '#fca5a5',
        brightGreen: '#4ade80',
        brightYellow: '#fcd34d',
        brightBlue: '#93c5fd',
        brightMagenta: '#d8b4fe',
        brightCyan: '#67e8f9',
        brightWhite: '#ffffff',
      } : {
        background: '#f8fafc',
        foreground: '#334155',
        cursor: '#059669',
        cursorAccent: '#f8fafc',
        selectionBackground: '#05966933',
        selectionForeground: '#0f172a',
        black: '#1e293b',
        red: '#dc2626',
        green: '#059669',
        yellow: '#d97706',
        blue: '#2563eb',
        magenta: '#9333ea',
        cyan: '#0891b2',
        white: '#1e293b',
        brightBlack: '#64748b',
        brightRed: '#ef4444',
        brightGreen: '#10b981',
        brightYellow: '#f59e0b',
        brightBlue: '#3b82f6',
        brightMagenta: '#a855f7',
        brightCyan: '#06b6d4',
        brightWhite: '#0f172a',
      },
      fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
      fontSize: 14,
      lineHeight: 1.6,
      cursorBlink: true,
      cursorStyle: 'block',
    })

    const fitAddon = new FitAddon()
    xterm.loadAddon(fitAddon)
    xterm.open(terminalRef.current)
    fitTerminal()

    xtermRef.current = xterm
    fitAddonRef.current = fitAddon

    window.addEventListener('resize', handleResize)

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            fitTerminal()
          })
        : null

    if (resizeObserver) {
      resizeObserver.observe(terminalRef.current)
    }

    // Welcome message
    xterm.writeln('')
    xterm.writeln('\x1b[1;32m  欢迎来到 Linux 学习终端!\x1b[0m')
    xterm.writeln('\x1b[90m  输入命令开始你的学习之旅...\x1b[0m')
    xterm.writeln('')
    xterm.write(generatePrompt(currentDirRef.current))

    xterm.onData((data) => {
      const code = data.charCodeAt(0)

      if (code === 13) {
        const command = inputBufferRef.current.trim()
        xterm.writeln('')

        if (command) {
          const currentSessionId = sessionIdRef.current
          if (currentSessionId) {
            lastCommandRef.current = command
            socket.emit('terminal:input', {
              sessionId: currentSessionId,
              command,
              levelId: levelIdRef.current
            })
          } else {
            xterm.writeln('\x1b[31m  错误: 未连接到会话\x1b[0m')
            xterm.write(generatePrompt(currentDirRef.current))
          }
        } else {
          xterm.write(generatePrompt(currentDirRef.current))
        }

        inputBufferRef.current = ''
      } else if (code === 127) {
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1)
          xterm.write('\b \b')
        }
      } else if (code === 27) {
        // Arrow keys - could implement history
      } else if (code >= 32) {
        inputBufferRef.current += data
        xterm.write(data)
      }
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver?.disconnect()
      xterm.dispose()
    }
  }, [isDark, fitTerminal, handleResize])

  useEffect(() => {
    if (xtermRef.current && sessionId) {
      xtermRef.current.clear()
      currentDirRef.current = initialDir
      onDirectoryChange?.(initialDir)
      xtermRef.current.writeln('\x1b[1;36m  会话已创建，开始关卡 ' + levelId + '\x1b[0m')
      xtermRef.current.writeln('')
      xtermRef.current.write(generatePrompt(currentDirRef.current))
    }
  }, [sessionId, levelId, initialDir, onDirectoryChange])

  useEffect(() => {
    const handleOutput = (data: {
      output: string
      currentDir?: string
      completed?: boolean
    }) => {
      if (xtermRef.current) {
        if (data.currentDir) {
          currentDirRef.current = data.currentDir
          onDirectoryChange?.(data.currentDir)
        }

        if (data.output) {
          xtermRef.current.write(data.output)
        }

        if (data.completed === false && lastCommandRef.current) {
          onCommandResult?.(lastCommandRef.current, data.output || '', false)
        }

        xtermRef.current.write('\r\n' + generatePrompt(currentDirRef.current))
      }
    }

    const handleSessionExpired = () => {
      if (!xtermRef.current) return

      xtermRef.current.writeln('\x1b[33m⚠ 会话已过期，环境已重新初始化\x1b[0m')
    }

    const handleSessionError = (data: { message: string }) => {
      if (!xtermRef.current) return

      xtermRef.current.write(`\r\n\x1b[31mError: ${data.message}\x1b[0m`)
      xtermRef.current.write('\r\n' + generatePrompt(currentDirRef.current))
    }

    socket.on('terminal:output', handleOutput)
    socket.on('session:expired', handleSessionExpired)
    socket.on('session:error', handleSessionError)

    return () => {
      socket.off('terminal:output', handleOutput)
      socket.off('session:expired', handleSessionExpired)
      socket.off('session:error', handleSessionError)
    }
  }, [onCommandResult, onDirectoryChange])

  return (
    <div
      ref={terminalRef}
      className="w-full h-full"
      style={{
        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
        padding: '4px'
      }}
    />
  )
}
