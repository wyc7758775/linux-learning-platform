import { useEffect, type MutableRefObject } from 'react'
import type { Terminal as XTerminal } from '@xterm/xterm'
import { socket } from '../../../services/socket'
import { generatePrompt } from '../terminalPrompt'

interface UseTerminalInputOptions {
  xterm: XTerminal | null
  currentDirRef: MutableRefObject<string>
  inputBufferRef: MutableRefObject<string>
  lastCommandRef: MutableRefObject<string>
  levelIdRef: MutableRefObject<number>
  sessionIdRef: MutableRefObject<string>
}

export function useTerminalInput({
  xterm,
  currentDirRef,
  inputBufferRef,
  lastCommandRef,
  levelIdRef,
  sessionIdRef,
}: UseTerminalInputOptions) {
  useEffect(() => {
    if (!xterm) return

    const disposable = xterm.onData((data) => {
      const code = data.charCodeAt(0)

      if (code === 13) {
        const command = inputBufferRef.current.trim()
        xterm.writeln('')

        if (!command) {
          xterm.write(generatePrompt(currentDirRef.current))
          inputBufferRef.current = ''
          return
        }

        if (!sessionIdRef.current) {
          xterm.writeln('\x1b[31m  错误: 未连接到会话\x1b[0m')
          xterm.write(generatePrompt(currentDirRef.current))
          inputBufferRef.current = ''
          return
        }

        lastCommandRef.current = command
        socket.emit('terminal:input', {
          sessionId: sessionIdRef.current,
          command,
          levelId: levelIdRef.current,
        })
        inputBufferRef.current = ''
        return
      }

      if (code === 127) {
        if (inputBufferRef.current.length > 0) {
          inputBufferRef.current = inputBufferRef.current.slice(0, -1)
          xterm.write('\b \b')
        }
        return
      }

      if (code === 27) {
        return
      }

      if (code >= 32) {
        inputBufferRef.current += data
        xterm.write(data)
      }
    })

    return () => disposable.dispose()
  }, [currentDirRef, inputBufferRef, lastCommandRef, levelIdRef, sessionIdRef, xterm])
}
