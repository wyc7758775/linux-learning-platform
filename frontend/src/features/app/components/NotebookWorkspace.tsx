import { Terminal } from '../../../components/Terminal/Terminal'
import { WrongNotebook } from '../../../components/WrongNotebook/WrongNotebook'
import type { Level } from '../../../data/levels'

interface NotebookWorkspaceProps {
  currentDir: string
  currentLevel: number
  isActive: boolean
  isDark: boolean
  levels: Level[]
  onDirectoryChange: (dir: string) => void
  sessionId: string
}

export function NotebookWorkspace({
  currentDir,
  currentLevel,
  isActive,
  isDark,
  levels,
  onDirectoryChange,
  sessionId,
}: NotebookWorkspaceProps) {
  return (
    <div className={`flex-1 flex overflow-hidden ${isActive ? 'pointer-events-auto' : 'pointer-events-none absolute inset-0 opacity-0'}`}>
      <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
        <WrongNotebook levels={levels} />
      </div>
      <main className="hidden" aria-hidden="true">
        <Terminal
          sessionId={sessionId}
          levelId={currentLevel}
          initialDir={currentDir}
          onDirectoryChange={onDirectoryChange}
        />
      </main>
    </div>
  )
}
