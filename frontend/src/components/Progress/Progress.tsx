import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import type { Level } from '../../levels'

interface ProgressProps {
  levels: Level[]
  currentLevel: number
  onSelectLevel: (levelId: number) => void
}

const chapterConfig: Record<number, { name: string; color: string; icon: string }> = {
  1: {
    name: '终端初识',
    color: 'from-blue-500 to-cyan-500',
    icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  },
  2: {
    name: '权限实战',
    color: 'from-amber-500 to-orange-500',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
  },
  3: {
    name: '事故响应',
    color: 'from-red-500 to-pink-500',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
  },
  4: {
    name: '部署上线',
    color: 'from-green-500 to-teal-500',
    icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
  },
}

export function Progress({ levels, currentLevel, onSelectLevel }: ProgressProps) {
  const { isDark } = useTheme()
  const chapters = [...new Set(levels.map(l => l.chapter))]
  const completedCount = levels.filter(l => l.completed).length
  const progressPercent = (completedCount / levels.length) * 100

  // 当前关卡所在章节
  const currentChapter = levels.find(l => l.id === currentLevel)?.chapter

  // 展开/收起状态 - 默认只展开当前章节
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([currentChapter || 1]))

  // 关卡内容高度引用，用于动画
  const contentRefs = useRef<Record<number, HTMLDivElement | null>>({})

  // 当关卡变化时，自动展开对应章节
  useEffect(() => {
    if (currentChapter && !expandedChapters.has(currentChapter)) {
      setExpandedChapters(prev => new Set([...prev, currentChapter]))
    }
  }, [currentChapter])

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters(prev => {
      const next = new Set(prev)
      if (next.has(chapterId)) {
        next.delete(chapterId)
      } else {
        next.add(chapterId)
      }
      return next
    })
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${
      isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              学习进度
            </h3>
          </div>
          <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {completedCount}/{levels.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chapters - 使用稳定滚动条 */}
      <div className={`p-4 space-y-2 max-h-[400px] overflow-y-auto ${
        isDark ? 'scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600' : 'scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300'
      }`} style={{ scrollbarGutter: 'stable' }}>
        {chapters.map(chapter => {
          const config = chapterConfig[chapter] || {
            name: '高级内容',
            color: 'from-purple-500 to-violet-500',
            icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
          }
          const chapterLevels = levels.filter(l => l.chapter === chapter)
          const isExpanded = expandedChapters.has(chapter)
          const chapterCompleted = chapterLevels.every(l => l.completed)
          const chapterProgress = chapterLevels.filter(l => l.completed).length / chapterLevels.length

          return (
            <div key={chapter} className={`rounded-xl overflow-hidden transition-colors ${
              isDark ? 'bg-slate-700/30' : 'bg-slate-50/50'
            }`}>
              {/* Chapter header - clickable */}
              <button
                onClick={() => toggleChapter(chapter)}
                className={`w-full px-4 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-slate-600/30' : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
                    </svg>
                  </div>
                  <div className="text-left">
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      第 {chapter} 章: {config.name}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {/* Mini progress bar */}
                      <div className={`w-16 h-1 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${chapterProgress * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {chapterLevels.filter(l => l.completed).length}/{chapterLevels.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expand/Collapse icon */}
                <div className="flex items-center gap-2">
                  {chapterCompleted && (
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ease-out ${
                      isExpanded ? 'rotate-180' : ''
                    } ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Chapter levels - with smooth animation */}
              <div
                ref={el => contentRefs.current[chapter] = el}
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{
                  maxHeight: isExpanded ? `${chapterLevels.length * 48 + 16}px` : '0px',
                  opacity: isExpanded ? 1 : 0,
                }}
              >
                <div className="px-4 pt-4 pb-3">
                  <div className="grid grid-cols-5 gap-1.5">
                    {chapterLevels.map(level => {
                      const isUnlocked = level.id === 1 || levels.find(l => l.id === level.id - 1)?.completed
                      const isCurrent = level.id === currentLevel

                      return (
                        <button
                          key={level.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isUnlocked) onSelectLevel(level.id)
                          }}
                          disabled={!isUnlocked}
                          className={`
                            relative h-9 rounded-lg font-semibold text-sm transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer
                            ${isDark ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'}
                            ${level.completed
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30 focus:ring-green-400'
                              : isCurrent
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-400/50 focus:ring-blue-400'
                                : isUnlocked
                                  ? isDark
                                    ? 'bg-slate-600/50 text-slate-300 hover:bg-slate-600 focus:ring-slate-500'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 focus:ring-slate-300 shadow-sm'
                                  : isDark
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }
                          `}
                          title={level.title}
                        >
                          {level.completed ? (
                            <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            level.id
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
