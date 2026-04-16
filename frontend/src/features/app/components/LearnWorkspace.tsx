import { Level } from '../../../components/Level/Level'
import { Progress } from '../../../components/Progress/Progress'
import { DesktopTerminalPanel } from './DesktopTerminalPanel'
import type { Level as LevelType } from '../../../data/levels'

interface LearnWorkspaceProps {
  activeLevel?: LevelType
  currentDir: string
  currentLevel: number
  isActive: boolean
  isDark: boolean
  isTerminalExpanded: boolean
  levelCompleted: boolean
  levels: LevelType[]
  onCommandResult: (command: string, output: string, completed: boolean) => void
  onDirectoryChange: (dir: string) => void
  onNextLevel: () => void
  onSelectLevel: (levelId: number) => void
  onToggleTerminalExpanded: () => void
  sessionId: string
}

export function LearnWorkspace({
  activeLevel,
  currentDir,
  currentLevel,
  isActive,
  isDark,
  isTerminalExpanded,
  levelCompleted,
  levels,
  onCommandResult,
  onDirectoryChange,
  onNextLevel,
  onSelectLevel,
  onToggleTerminalExpanded,
  sessionId,
}: LearnWorkspaceProps) {
  return (
    <div className={`flex-1 flex overflow-hidden ${isActive ? 'pointer-events-auto' : 'pointer-events-none absolute inset-0 opacity-0'}`}>
      <aside className={`w-full lg:w-[400px] flex-shrink-0 flex flex-col ${
        isDark ? 'bg-slate-900/50 lg:border-r lg:border-slate-800' : 'bg-slate-50 lg:border-r lg:border-slate-200'
      }`}>
        <div className="p-4 sm:p-6 flex-1 min-h-0 flex flex-col gap-4">
          <div className="h-[380px] flex-shrink-0">
            <Progress levels={levels} currentLevel={currentLevel} onSelectLevel={onSelectLevel} />
          </div>
          {activeLevel && (
            <div className="flex-1 min-h-0">
              <Level
                level={activeLevel}
                completed={levelCompleted}
                showCompletionPrompt={levelCompleted}
                onNextLevel={onNextLevel}
                hasNextLevel={currentLevel < levels.length}
              />
            </div>
          )}
        </div>
      </aside>

      <DesktopTerminalPanel
        currentDir={currentDir}
        currentLevel={currentLevel}
        isDark={isDark}
        isTerminalExpanded={isTerminalExpanded}
        onCommandResult={onCommandResult}
        onDirectoryChange={onDirectoryChange}
        onToggleExpanded={onToggleTerminalExpanded}
        sessionId={sessionId}
      />
    </div>
  )
}
