import { useTheme } from '../../contexts/ThemeContext'
import type { Level } from '../../data/levels'
import { ChapterAccordion } from './components/ChapterAccordion'
import { ProgressHeader } from './components/ProgressHeader'
import { useExpandedChapters } from './hooks/useExpandedChapters'

interface ProgressProps {
  levels: Level[]
  currentLevel: number
  onSelectLevel: (levelId: number) => void
}

export function Progress({ levels, currentLevel, onSelectLevel }: ProgressProps) {
  const { isDark } = useTheme()
  const chapters = [...new Set(levels.map((level) => level.chapter))]
  const currentChapter = levels.find((level) => level.id === currentLevel)?.chapter
  const completedCount = levels.filter((level) => level.completed).length
  const progressPercent = (completedCount / levels.length) * 100
  const { expandedChapters, toggleChapter } = useExpandedChapters(currentChapter)

  return (
    <div className={`rounded-2xl border overflow-hidden h-full min-h-0 flex flex-col ${
      isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <ProgressHeader
        completedCount={completedCount}
        totalCount={levels.length}
        progressPercent={progressPercent}
        isDark={isDark}
      />

      <div className={`p-4 space-y-2 flex-1 overflow-y-auto ${
        isDark ? 'scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600' : 'scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300'
      }`} style={{ scrollbarGutter: 'stable' }}>
        {chapters.map((chapter) => (
          <ChapterAccordion
            key={chapter}
            allLevels={levels}
            chapter={chapter}
            levels={levels.filter((level) => level.chapter === chapter)}
            currentLevel={currentLevel}
            isDark={isDark}
            isExpanded={expandedChapters.has(chapter)}
            onToggle={() => toggleChapter(chapter)}
            onSelectLevel={onSelectLevel}
          />
        ))}
      </div>
    </div>
  )
}
