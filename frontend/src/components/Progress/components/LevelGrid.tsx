import type { Level } from '../../../data/levels'

interface LevelGridProps {
  allLevels: Level[]
  levels: Level[]
  currentLevel: number
  isDark: boolean
  onSelectLevel: (levelId: number) => void
}

export function LevelGrid({ allLevels, levels, currentLevel, isDark, onSelectLevel }: LevelGridProps) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {levels.map((level) => {
        const isUnlocked = level.id === 1 || allLevels.find((item) => item.id === level.id - 1)?.completed
        const isCurrent = level.id === currentLevel

        return (
          <button
            key={level.id}
            onClick={(event) => {
              event.stopPropagation()
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
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
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
  )
}
