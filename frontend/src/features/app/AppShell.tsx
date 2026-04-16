import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { AppHeader } from './components/AppHeader'
import { LearnWorkspace } from './components/LearnWorkspace'
import { MobileTerminalNotice } from './components/MobileTerminalNotice'
import { NotebookWorkspace } from './components/NotebookWorkspace'
import { useProgressSync } from './hooks/useProgressSync'
import { useSessionLifecycle } from './hooks/useSessionLifecycle'
import { useWrongRecordCount } from './hooks/useWrongRecordCount'
import type { ActiveTab, AppUser } from './types'

export function AppShell() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('learn')
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false)
  const { isDark } = useTheme()
  const { user } = useAuth()
  const typedUser = user as AppUser | null
  const { currentLevel, levels, setCurrentLevel, setLevels } = useProgressSync(typedUser)
  const { refreshWrongRecordCount, wrongRecordCount } = useWrongRecordCount(typedUser, activeTab)
  const { connected, currentDir, handleCommandResult, levelCompleted, sessionId, setCurrentDir, setLevelCompleted } = useSessionLifecycle({
    currentLevel,
    levels,
    refreshWrongRecordCount,
    setLevels,
    user: typedUser,
  })

  const activeLevel = levels.find((level) => level.id === currentLevel)
  const completedCount = levels.filter((level) => level.completed).length

  useEffect(() => {
    if (activeTab !== 'learn' && isTerminalExpanded) {
      setIsTerminalExpanded(false)
    }
  }, [activeTab, isTerminalExpanded])

  useEffect(() => {
    if (!isTerminalExpanded) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsTerminalExpanded(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isTerminalExpanded])

  const switchTab = (tab: ActiveTab) => {
    if (tab !== activeTab) setActiveTab(tab)
  }

  const handleNextLevel = () => {
    if (currentLevel < levels.length) {
      setLevelCompleted(false)
      setCurrentLevel((previous) => previous + 1)
    }
  }

  const handleSelectLevel = (levelId: number) => {
    const level = levels.find((item) => item.id === levelId)
    const isUnlocked = level && (level.id === 1 || levels.find((item) => item.id === levelId - 1)?.completed)
    if (isUnlocked) {
      setLevelCompleted(false)
      setCurrentLevel(levelId)
    }
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <AppHeader
        activeTab={activeTab}
        completedCount={completedCount}
        connected={connected}
        isDark={isDark}
        levelsCount={levels.length}
        onSwitchTab={switchTab}
        user={typedUser}
        wrongRecordCount={wrongRecordCount}
      />
      <LearnWorkspace
        activeLevel={activeLevel}
        currentDir={currentDir}
        currentLevel={currentLevel}
        isActive={activeTab === 'learn'}
        isDark={isDark}
        isTerminalExpanded={isTerminalExpanded}
        levelCompleted={levelCompleted}
        levels={levels}
        onCommandResult={handleCommandResult}
        onDirectoryChange={setCurrentDir}
        onNextLevel={handleNextLevel}
        onSelectLevel={handleSelectLevel}
        onToggleTerminalExpanded={() => setIsTerminalExpanded((current) => !current)}
        sessionId={sessionId}
      />
      <NotebookWorkspace
        currentDir={currentDir}
        currentLevel={currentLevel}
        isActive={activeTab === 'notebook'}
        isDark={isDark}
        levels={levels}
        onDirectoryChange={setCurrentDir}
        sessionId={sessionId}
      />
      <MobileTerminalNotice isDark={isDark} />
    </div>
  )
}
