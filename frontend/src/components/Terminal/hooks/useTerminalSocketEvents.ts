import { useEffect, type MutableRefObject } from 'react'
import type { Terminal as XTerminal } from '@xterm/xterm'
import { socket } from '../../../services/socket'
import { generatePrompt } from '../terminalPrompt'
import type { TerminalErrorPayload, TerminalOutputPayload } from '../types'

interface UseTerminalSocketEventsOptions {
  xterm: XTerminal | null
  currentDirRef: MutableRefObject<string>
  lastCommandRef: MutableRefObject<string>
  onDirectoryChange?: (dir: string) => void
  onCommandResult?: (command: string, output: string, completed: boolean) => void
}

export function useTerminalSocketEvents({
  xterm,
  currentDirRef,
  lastCommandRef,
  onDirectoryChange,
  onCommandResult,
}: UseTerminalSocketEventsOptions) {
  useEffect(() => {
    if (!xterm) return

    const handleOutput = (data: TerminalOutputPayload) => {
      if (data.currentDir) {
        currentDirRef.current = data.currentDir
        onDirectoryChange?.(data.currentDir)
      }

      if (data.output) {
        xterm.write(data.output)
      }

      if (data.completed === false && lastCommandRef.current) {
        onCommandResult?.(lastCommandRef.current, data.output || '', false)
      }

      xterm.write(`\r\n${generatePrompt(currentDirRef.current)}`)
    }

    const handleSessionExpired = () => {
      xterm.writeln('\x1b[33m⚠ 会话已过期，环境已重新初始化\x1b[0m')
    }

    const handleSessionError = (data: TerminalErrorPayload) => {
      xterm.write(`\r\n\x1b[31mError: ${data.message}\x1b[0m`)
      xterm.write(`\r\n${generatePrompt(currentDirRef.current)}`)
    }

    socket.on('terminal:output', handleOutput)
    socket.on('session:expired', handleSessionExpired)
    socket.on('session:error', handleSessionError)

    return () => {
      socket.off('terminal:output', handleOutput)
      socket.off('session:expired', handleSessionExpired)
      socket.off('session:error', handleSessionError)
    }
  }, [currentDirRef, lastCommandRef, onCommandResult, onDirectoryChange, xterm])
}
