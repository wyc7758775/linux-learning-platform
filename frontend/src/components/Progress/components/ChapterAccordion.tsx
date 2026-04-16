import type { Level } from '../../../data/levels'
import { getChapterConfig } from '../progress.config'
import { LevelGrid } from './LevelGrid'

interface ChapterAccordionProps {
  allLevels: Level[]
  chapter: number
  levels: Level[]
  currentLevel: number
  isDark: boolean
  isExpanded: boolean
  onToggle: () => void
  onSelectLevel: (levelId: number) => void
}

export function ChapterAccordion({
  allLevels,
  chapter,
  levels,
  currentLevel,
  isDark,
  isExpanded,
  onToggle,
  onSelectLevel,
}: ChapterAccordionProps) {
  const config = getChapterConfig(chapter)
  const completedCount = levels.filter((level) => level.completed).length
  const chapterCompleted = levels.every((level) => level.completed)
  const chapterProgress = completedCount / levels.length

  return (
    <div className={`rounded-xl overflow-hidden transition-colors ${isDark ? 'bg-slate-700/30' : 'bg-slate-50/50'}`}>
      <button
        onClick={onToggle}
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
              <div className={`w-16 h-1 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${chapterProgress * 100}%` }}
                />
              </div>
              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {completedCount}/{levels.length}
              </span>
            </div>
          </div>
        </div>

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

      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: isExpanded ? `${levels.length * 48 + 16}px` : '0px', opacity: isExpanded ? 1 : 0 }}
      >
        <div className="px-4 pt-4 pb-3">
          <LevelGrid
            allLevels={allLevels}
            levels={levels}
            currentLevel={currentLevel}
            isDark={isDark}
            onSelectLevel={onSelectLevel}
          />
        </div>
      </div>
    </div>
  )
}
