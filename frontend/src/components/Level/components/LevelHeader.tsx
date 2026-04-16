import type { Level as LevelType } from '../../../data/levels'
import { chapterColors } from '../constants'

interface LevelHeaderProps {
  level: LevelType
  isCompleted: boolean
  isDark: boolean
}

export function LevelHeader({ level, isCompleted, isDark }: LevelHeaderProps) {
  return (
    <div className={`px-5 py-3 border-b flex-shrink-0 ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              第 {level.chapter} 章
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                已完成
              </span>
            )}
          </div>
          <h2 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {level.title}
          </h2>
        </div>
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${
          chapterColors[level.chapter] || 'from-purple-500 to-violet-500'
        } flex items-center justify-center text-white text-xs font-bold shadow-lg flex-shrink-0`}>
          {level.id}
        </div>
      </div>
    </div>
  )
}
