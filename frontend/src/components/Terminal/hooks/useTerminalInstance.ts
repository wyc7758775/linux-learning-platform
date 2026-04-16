import { useEffect, useState, type RefObject } from 'react'
import { Terminal as XTerminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { generatePrompt } from '../terminalPrompt'
import { getTerminalTheme } from '../terminalTheme'

interface UseTerminalInstanceOptions {
  terminalRef: RefObject<HTMLDivElement | null>
  currentDir: string
  isDark: boolean
}

export function useTerminalInstance({
  terminalRef,
  currentDir,
  isDark,
}: UseTerminalInstanceOptions) {
  const [xterm, setXterm] = useState<XTerminal | null>(null)

  useEffect(() => {
    if (!terminalRef.current) return

    const terminal = new XTerminal({
      theme: getTerminalTheme(isDark),
      fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
      fontSize: 14,
      lineHeight: 1.6,
      cursorBlink: true,
      cursorStyle: 'block',
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(terminalRef.current)

    const fitTerminal = () => {
      window.requestAnimationFrame(() => {
        fitAddon.fit()
      })
    }

    fitTerminal()
    setXterm(terminal)
    window.addEventListener('resize', fitTerminal)

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => fitTerminal())
      : null

    resizeObserver?.observe(terminalRef.current)

    terminal.writeln('')
    terminal.writeln('\x1b[1;32m  欢迎来到 Linux 学习终端!\x1b[0m')
    terminal.writeln('\x1b[90m  输入命令开始你的学习之旅...\x1b[0m')
    terminal.writeln('')
    terminal.write(generatePrompt(currentDir))

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', fitTerminal)
      setXterm(null)
      terminal.dispose()
    }
  }, [currentDir, isDark, terminalRef])

  return xterm
}
