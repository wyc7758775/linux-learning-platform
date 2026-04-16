import type { NotebookStats } from '../types'

interface NotebookStatsBarProps {
  isDark: boolean
  stats: NotebookStats
}

export function NotebookStatsBar({ isDark, stats }: NotebookStatsBarProps) {
  return (
    <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
            <svg className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>错题本</h2>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
        }`}>
          {stats.total} 条
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '涉及关卡', value: stats.levels },
          { label: '涉及章节', value: stats.chapters },
          { label: '最近错误', value: stats.latestTime, compact: true },
        ].map((item) => (
          <div key={item.label} className={`rounded-lg px-3 py-2 ${isDark ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
            <div className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</div>
            <div className={`${item.compact ? 'text-sm truncate' : 'text-lg'} font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
