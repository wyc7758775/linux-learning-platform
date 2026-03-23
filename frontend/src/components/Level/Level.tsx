import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import type { Level as LevelType } from '../../levels'
import { Firework } from '../Firework/Firework'

interface LevelProps {
  level: LevelType
  completed: boolean
  onNextLevel: () => void
  hasNextLevel: boolean
}

export function Level({ level, completed, onNextLevel, hasNextLevel }: LevelProps) {
  const [showHint, setShowHint] = useState(false)
  const [showFirework, setShowFirework] = useState(false)
  const [showKnowledge, setShowKnowledge] = useState(true)
  const prevCompletedRef = useRef(false)
  const { isDark } = useTheme()

  useEffect(() => {
    if (completed && !prevCompletedRef.current) {
      setShowFirework(true)
    }
    prevCompletedRef.current = completed
  }, [completed])

  useEffect(() => {
    setShowHint(false)
  }, [level.id])

  const handleNextLevel = () => {
    setShowFirework(false)
    onNextLevel()
  }

  const chapterColors: Record<number, string> = {
    1: 'from-blue-500 to-cyan-500',
    2: 'from-amber-500 to-orange-500',
    3: 'from-red-500 to-pink-500',
  }

  return (
    <>
      {showFirework && <Firework onComplete={() => setShowFirework(false)} duration={3000} />}

      <div className={`rounded-2xl border overflow-hidden ${
        isDark
          ? 'bg-slate-800/50 border-slate-700/50'
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b ${
          isDark ? 'border-slate-700/50' : 'border-slate-100'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isDark
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  第 {level.chapter} 章
                </span>
                {completed && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    已完成
                  </span>
                )}
              </div>
              <h2 className={`text-lg font-bold truncate ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {level.title}
              </h2>
            </div>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
              chapterColors[level.chapter] || 'from-purple-500 to-violet-500'
            } flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
              {level.id}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Description */}
          <p className={`text-sm leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {level.description}
          </p>

          {/* Knowledge cards */}
          {level.knowledgeCards && level.knowledgeCards.length > 0 && (
            <div>
              <button
                onClick={() => setShowKnowledge(!showKnowledge)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
                  isDark
                    ? 'text-blue-400 hover:text-blue-300'
                    : 'text-blue-600 hover:text-blue-500'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>本关知识点</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${showKnowledge ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showKnowledge && (
                <div className={`mt-3 rounded-xl p-4 border ${
                  isDark
                    ? 'bg-slate-900/50 border-slate-700/50'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  {level.knowledgeCards.map((card, i) => (
                    <div key={i} className={i > 0 ? 'mt-4 pt-4 border-t border-dashed ' + (isDark ? 'border-slate-700' : 'border-slate-200') : ''}>
                      <div className="flex items-start gap-2">
                        <code className={`px-2 py-0.5 rounded font-mono font-bold text-sm ${
                          isDark
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-green-50 text-green-700'
                        }`}>
                          {card.command}
                        </code>
                      </div>
                      <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {card.description}
                      </p>
                      {card.flags && card.flags.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {card.flags.map((f, j) => (
                            <div key={j} className="flex items-start gap-2 text-xs">
                              <code className={`font-mono ${
                                isDark ? 'text-amber-400' : 'text-amber-600'
                              }`}>
                                {f.flag}
                              </code>
                              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                                {f.meaning}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Objective or command */}
          {level.objective ? (
            <div className={`rounded-xl p-4 border ${
              isDark
                ? 'bg-blue-500/5 border-blue-500/20'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <svg className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    任务目标
                  </p>
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    {level.objective}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`rounded-xl p-4 ${
              isDark ? 'bg-slate-900/50' : 'bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                <svg className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  目标命令
                </span>
              </div>
              <code className={`mt-2 block font-mono text-sm ${
                isDark ? 'text-amber-400' : 'text-amber-600'
              }`}>
                {level.command}
              </code>
            </div>
          )}

          {/* Hint */}
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className={`flex items-center gap-2 text-sm transition-colors cursor-pointer ${
                isDark
                  ? 'text-slate-500 hover:text-slate-300'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              需要提示？
            </button>
          ) : (
            <div className={`rounded-xl p-4 border ${
              isDark
                ? 'bg-amber-500/5 border-amber-500/20'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDark ? 'bg-amber-500/20' : 'bg-amber-100'
                }`}>
                  <svg className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                  {level.hint}
                </p>
              </div>
            </div>
          )}

          {/* Completion */}
          {completed && (
            <div className={`rounded-xl p-4 border ${
              isDark
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDark
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                    : 'bg-gradient-to-br from-green-500 to-emerald-600'
                } shadow-lg shadow-green-500/25`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                    太棒了！
                  </p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    你已完成这个关卡
                  </p>
                </div>
              </div>
              {hasNextLevel && (
                <button
                  onClick={handleNextLevel}
                  className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                    isDark
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/25'
                      : 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:shadow-lg hover:shadow-green-500/25'
                  }`}
                >
                  继续下一关
                  <svg className="inline-block w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
