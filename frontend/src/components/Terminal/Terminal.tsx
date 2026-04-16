import { useEffect, useRef } from 'react'
import '@xterm/xterm/css/xterm.css'
import { useTheme } from '../../contexts/ThemeContext'
import { HOME_DIR } from '../../utils/terminal'
import { generatePrompt } from './terminalPrompt'
import { useTerminalInput } from './hooks/useTerminalInput'
import { useTerminalInstance } from './hooks/useTerminalInstance'
import { useTerminalSocketEvents } from './hooks/useTerminalSocketEvents'
import type { TerminalProps } from './types'

export function Terminal({
  sessionId,
  levelId,
  initialDir,
  onDirectoryChange,
  onCommandResult,
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputBufferRef = useRef('')
  const lastCommandRef = useRef('')
  const sessionIdRef = useRef(sessionId)
  const levelIdRef = useRef(levelId)
  const currentDirRef = useRef(initialDir || HOME_DIR)
  const { isDark } = useTheme()
  const xterm = useTerminalInstance({ terminalRef, currentDir: currentDirRef.current, isDark })

  useEffect(() => {
    sessionIdRef.current = sessionId
  }, [sessionId])

  useEffect(() => {
    levelIdRef.current = levelId
  }, [levelId])

  useTerminalInput({
    xterm,
    currentDirRef,
    inputBufferRef,
    lastCommandRef,
    levelIdRef,
    sessionIdRef,
  })

  useTerminalSocketEvents({
    xterm,
    currentDirRef,
    lastCommandRef,
    onDirectoryChange,
    onCommandResult,
  })

  useEffect(() => {
    if (!xterm || !sessionId) return

    xterm.clear()
    currentDirRef.current = initialDir
    onDirectoryChange?.(initialDir)
    xterm.writeln(`\x1b[1;36m  会话已创建，开始关卡 ${levelId}\x1b[0m`)
    xterm.writeln('')
    xterm.write(generatePrompt(currentDirRef.current))
  }, [initialDir, levelId, onDirectoryChange, sessionId, xterm])

  return (
    <div
      ref={terminalRef}
      className="w-full h-full"
      style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', padding: '4px' }}
    />
  )
}
