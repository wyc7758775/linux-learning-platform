interface ProgressHeaderProps {
  completedCount: number
  totalCount: number
  progressPercent: number
  isDark: boolean
}

export function ProgressHeader({
  completedCount,
  totalCount,
  progressPercent,
  isDark,
}: ProgressHeaderProps) {
  return (
    <div className={`px-5 py-3 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>学习进度</h3>
        </div>
        <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {completedCount}/{totalCount}
        </span>
      </div>

      <div className="mt-3">
        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
