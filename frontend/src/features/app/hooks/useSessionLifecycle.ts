import { useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { LEVELS, type Level } from '../../../data/levels'
import { wrongRecordApi, userApi } from '../../../services/api'
import { socket, connectSocket } from '../../../services/socket'
import { classifyError, isExploratoryCommand } from '../../../utils/classifyError'
import { HOME_DIR } from '../../../utils/terminal'
import { hasAuthToken, saveGuestProgress } from '../storage'
import type { AppUser } from '../types'

interface UseSessionLifecycleOptions {
  currentLevel: number
  levels: Level[]
  refreshWrongRecordCount: () => void
  setLevels: Dispatch<SetStateAction<Level[]>>
  user: AppUser | null
}

export function useSessionLifecycle({
  currentLevel,
  levels,
  refreshWrongRecordCount,
  setLevels,
  user,
}: UseSessionLifecycleOptions) {
  const [connected, setConnected] = useState(false)
  const [currentDir, setCurrentDir] = useState(HOME_DIR)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const currentLevelRef = useRef(1)
  const levelsRef = useRef<Level[]>(LEVELS)

  useEffect(() => {
    currentLevelRef.current = currentLevel
  }, [currentLevel])

  useEffect(() => {
    levelsRef.current = levels
  }, [levels])

  const persistProgress = (completedLevelId: number, nextLevels: Level[]) => {
    const completedLevels = nextLevels.filter((level) => level.completed).map((level) => level.id)
    if (hasAuthToken()) {
      userApi.updateProgress(completedLevelId, completedLevels).catch(() => {})
      return
    }

    saveGuestProgress(completedLevelId, completedLevels)
  }

  const handleCommandResult = async (command: string, output: string, completed: boolean) => {
    if (completed || !user || isExploratoryCommand(command)) {
      return
    }

    const levelId = currentLevelRef.current
    const activeLevel = levelsRef.current.find((level) => level.id === levelId)
    if (!activeLevel || activeLevel.completed) {
      return
    }

    try {
      const analysis = classifyError(command, output)
      await wrongRecordApi.create(levelId, command, output, activeLevel.hint, analysis.type)
      refreshWrongRecordCount()
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    connectSocket()

    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)
    const handleSessionCreated = (session: { id: string; currentDir: string }) => {
      setSessionId(session.id)
      setCurrentDir(session.currentDir)
    }
    const handleSessionError = () => setSessionId('')
    const handleLevelCompleted = (data: { levelId: number }) => {
      const previousLevels = levelsRef.current
      const completedLevelId = data.levelId
      const activeLevel = previousLevels.find((level) => level.id === completedLevelId)
      const nextLevel = previousLevels.find((level) => level.id === completedLevelId + 1)
      setLevelCompleted(Boolean(activeLevel && !activeLevel.completed && nextLevel && !nextLevel.completed))

      setLevels((previous) => {
        const nextLevels = previous.map((level) => (
          level.id === completedLevelId ? { ...level, completed: true } : level
        ))
        persistProgress(completedLevelId, nextLevels)
        return nextLevels
      })
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('session:created', handleSessionCreated)
    socket.on('session:error', handleSessionError)
    socket.on('level:completed', handleLevelCompleted)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('session:created', handleSessionCreated)
      socket.off('session:error', handleSessionError)
      socket.off('level:completed', handleLevelCompleted)
    }
  }, [setLevels])

  useEffect(() => {
    if (connected && currentLevel) {
      setSessionId('')
      socket.emit('session:create', { levelId: currentLevel })
    }
  }, [connected, currentLevel])

  return {
    connected,
    currentDir,
    handleCommandResult,
    levelCompleted,
    sessionId,
    setCurrentDir,
    setLevelCompleted,
  }
}
