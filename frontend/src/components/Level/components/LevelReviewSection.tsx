import type { Level as LevelType } from '../../../data/levels'

interface LevelReviewSectionProps {
  level: LevelType
  isDark: boolean
  isCompleted: boolean
}

export function LevelReviewSection({ level, isDark, isCompleted }: LevelReviewSectionProps) {
  if (!isCompleted || !level.completionKnowledgeCards || level.completionKnowledgeCards.length === 0) {
    return null
  }

  return (
    <div className={`rounded-xl p-4 border ${isDark ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
      <div className="flex items-center gap-2 mb-3">
        <svg className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>通关后复盘</p>
      </div>

      <div className="space-y-3">
        {level.completionKnowledgeCards.map((card, index) => (
          <div key={index} className={index > 0 ? `pt-3 border-t ${isDark ? 'border-slate-700/60' : 'border-slate-200'}` : ''}>
            <code className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-sm ${
              isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {card.command}
            </code>
            <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
