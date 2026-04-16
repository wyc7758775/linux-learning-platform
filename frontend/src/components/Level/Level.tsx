import { useTheme } from '../../contexts/ThemeContext'
import type { Level as LevelType } from '../../data/levels'
import { Firework } from '../Firework/Firework'
import { LevelCompletionPrompt } from './components/LevelCompletionPrompt'
import { LevelHeader } from './components/LevelHeader'
import { LevelHintBlock } from './components/LevelHintBlock'
import { LevelKnowledgeSection } from './components/LevelKnowledgeSection'
import { LevelObjectiveBlock } from './components/LevelObjectiveBlock'
import { LevelReviewSection } from './components/LevelReviewSection'
import { useLevelCelebration } from './hooks/useLevelCelebration'

interface LevelProps {
  level: LevelType
  completed: boolean
  showCompletionPrompt: boolean
  onNextLevel: () => void
  hasNextLevel: boolean
}

export function Level({ level, completed, showCompletionPrompt, onNextLevel, hasNextLevel }: LevelProps) {
  const { isDark } = useTheme()
  const isCompleted = level.completed || completed
  const { showFirework, dismissFirework, handleNextLevel } = useLevelCelebration(
    completed,
    level.id,
    onNextLevel,
  )

  return (
    <>
      {showFirework && <Firework onComplete={dismissFirework} duration={3000} />}

      <div className={`rounded-2xl border overflow-hidden h-full min-h-0 flex flex-col ${
        isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <LevelHeader level={level} isCompleted={isCompleted} isDark={isDark} />

        <div className={`p-5 space-y-4 flex-1 min-h-0 overflow-y-auto ${
          isDark ? 'scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600' : 'scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300'
        } ${showCompletionPrompt && hasNextLevel ? 'pb-40 lg:pb-5' : ''}`} style={{ scrollbarGutter: 'stable' }}>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{level.description}</p>
          <LevelKnowledgeSection level={level} isDark={isDark} />
          <LevelObjectiveBlock level={level} isDark={isDark} />
          <LevelHintBlock levelId={level.id} hint={level.hint} isDark={isDark} />

          {showCompletionPrompt && (
            <LevelCompletionPrompt
              hasNextLevel={hasNextLevel}
              isDark={isDark}
              onNextLevel={handleNextLevel}
            />
          )}

          <LevelReviewSection level={level} isDark={isDark} isCompleted={isCompleted} />
        </div>

        {showCompletionPrompt && hasNextLevel && (
          <LevelCompletionPrompt
            hasNextLevel={hasNextLevel}
            isDark={isDark}
            isMobile
            onNextLevel={handleNextLevel}
          />
        )}
      </div>
    </>
  )
}
