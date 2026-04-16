import { Terminal } from '../../../components/Terminal/Terminal'
import { formatDir } from '../../../utils/terminal'

interface DesktopTerminalPanelProps {
  currentDir: string
  currentLevel: number
  isDark: boolean
  isTerminalExpanded: boolean
  onCommandResult: (command: string, output: string, completed: boolean) => void
  onDirectoryChange: (dir: string) => void
  onToggleExpanded: () => void
  sessionId: string
}

export function DesktopTerminalPanel({
  currentDir,
  currentLevel,
  isDark,
  isTerminalExpanded,
  onCommandResult,
  onDirectoryChange,
  onToggleExpanded,
  sessionId,
}: DesktopTerminalPanelProps) {
  const terminalButtonLabel = isTerminalExpanded ? '恢复终端' : '放大终端'

  return (
    <main className="hidden lg:flex flex-1 flex-col min-w-0 p-4 sm:p-6">
      <div className={`flex-1 rounded-2xl overflow-hidden border shadow-2xl flex flex-col ${
        isDark ? 'bg-slate-800/50 border-slate-700/50 shadow-black/20' : 'bg-white border-slate-200 shadow-slate-200/50'
      } ${isTerminalExpanded ? isDark ? 'fixed inset-0 z-[70] rounded-none border-0 shadow-none bg-slate-950' : 'fixed inset-0 z-[70] rounded-none border-0 shadow-none bg-slate-50' : ''}`}>
        <div className={`shrink-0 px-4 py-3 flex items-center gap-3 ${isDark ? 'bg-slate-800/80 border-b border-slate-700/50' : 'bg-slate-100 border-b border-slate-200'}`}>
          <div className="flex items-center gap-1.5">
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${isDark ? 'bg-slate-600/90' : 'bg-slate-300'}`}></span>
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${isDark ? 'bg-slate-600/90' : 'bg-slate-300'}`}></span>
            <button
              type="button"
              onClick={onToggleExpanded}
              aria-label={terminalButtonLabel}
              title={terminalButtonLabel}
              className={`group relative flex h-5 w-5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 ${
                isDark ? 'focus-visible:ring-offset-slate-800' : 'focus-visible:ring-offset-slate-100'
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${
                  isTerminalExpanded
                    ? isDark ? 'bg-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,0.24)]' : 'bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.18)]'
                    : isDark ? 'bg-emerald-500 group-hover:bg-emerald-400' : 'bg-emerald-500 group-hover:bg-emerald-600'
                }`}
              ></span>
            </button>
          </div>
          <div className="flex-1 text-center">
            <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{`player@linux:${formatDir(currentDir)}`}</span>
          </div>
          <div className={`shrink-0 text-[11px] font-medium tracking-[0.08em] uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {isTerminalExpanded ? 'Focus' : 'Terminal'}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <Terminal
            sessionId={sessionId}
            levelId={currentLevel}
            initialDir={currentDir}
            onDirectoryChange={onDirectoryChange}
            onCommandResult={onCommandResult}
          />
        </div>
      </div>
    </main>
  )
}
