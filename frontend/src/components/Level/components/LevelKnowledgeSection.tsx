import { useEffect, useState } from 'react'
import type { Level as LevelType } from '../../../data/levels'

interface LevelKnowledgeSectionProps {
  level: LevelType
  isDark: boolean
}

export function LevelKnowledgeSection({ level, isDark }: LevelKnowledgeSectionProps) {
  const [showKnowledge, setShowKnowledge] = useState(true)

  useEffect(() => {
    setShowKnowledge(true)
  }, [level.id])

  if (!level.knowledgeCards || level.knowledgeCards.length === 0) {
    return null
  }

  return (
    <div>
      <button
        onClick={() => setShowKnowledge((current) => !current)}
        className={`flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
          isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span>相关知识点</span>
        <svg className={`w-4 h-4 transition-transform duration-200 ${showKnowledge ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showKnowledge && (
        <div className={`mt-3 rounded-xl p-4 border ${isDark ? 'bg-slate-900/50 border-slate-700/50' : 'bg-slate-50 border-slate-200'}`}>
          {level.knowledgeCards.map((card, index) => (
            <div key={index} className={index > 0 ? `mt-4 pt-4 border-t border-dashed ${isDark ? 'border-slate-700' : 'border-slate-200'}` : ''}>
              <div className="flex items-start gap-2">
                <code className={`px-2 py-0.5 rounded font-mono font-bold text-sm ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'}`}>
                  {card.command}
                </code>
              </div>
              <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{card.description}</p>
              {card.flags && card.flags.length > 0 && (
                <div className="mt-2 space-y-1">
                  {card.flags.map((flag, flagIndex) => (
                    <div key={flagIndex} className="flex items-start gap-2 text-xs">
                      <code className={`font-mono ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{flag.flag}</code>
                      <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{flag.meaning}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
