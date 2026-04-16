import { useEffect, useState } from 'react'

interface LevelHintBlockProps {
  levelId: number
  hint: string
  isDark: boolean
}

export function LevelHintBlock({ levelId, hint, isDark }: LevelHintBlockProps) {
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    setShowHint(false)
  }, [levelId])

  if (!showHint) {
    return (
      <button
        onClick={() => setShowHint(true)}
        className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${
          isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        相关知识点
      </button>
    )
  }

  return (
    <div className={`rounded-xl p-4 border ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
          <svg className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>{hint}</p>
      </div>
    </div>
  )
}
