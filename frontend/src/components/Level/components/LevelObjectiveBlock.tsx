import type { Level as LevelType } from '../../../data/levels'

interface LevelObjectiveBlockProps {
  level: LevelType
  isDark: boolean
}

export function LevelObjectiveBlock({ level, isDark }: LevelObjectiveBlockProps) {
  if (level.objective) {
    return (
      <div className={`rounded-xl p-4 border ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <svg className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>任务目标</p>
            <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>{level.objective}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl p-4 ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
      <div className="flex items-center gap-2">
        <svg className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>目标命令</span>
      </div>
      <code className={`mt-2 block font-mono text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{level.command}</code>
    </div>
  )
}
