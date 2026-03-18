import type { Level } from '../../levels'

interface ProgressProps {
  levels: Level[]
  currentLevel: number
  onSelectLevel: (levelId: number) => void
}

export function Progress({ levels, currentLevel, onSelectLevel }: ProgressProps) {
  const chapters = [...new Set(levels.map(l => l.chapter))]

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">关卡进度</h3>

      <div className="space-y-4">
        {chapters.map(chapter => {
          const chapterLevels = levels.filter(l => l.chapter === chapter)
          const chapterNames: Record<number, string> = {
            1: '终端初识',
            2: '文件操作',
            3: '查看与编辑',
            4: '搜索与查找',
            5: '管道与重定向',
          }

          return (
            <div key={chapter}>
              <h4 className="text-sm font-medium text-gray-400 mb-2">
                第 {chapter} 章: {chapterNames[chapter] || '高级内容'}
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {chapterLevels.map(level => {
                  const isUnlocked = level.id === 1 || levels.find(l => l.id === level.id - 1)?.completed
                  const isCurrent = level.id === currentLevel

                  return (
                    <button
                      key={level.id}
                      onClick={() => isUnlocked && onSelectLevel(level.id)}
                      disabled={!isUnlocked}
                      className={`
                        w-10 h-10 rounded-lg font-medium text-sm transition-all
                        ${level.completed
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : isCurrent
                            ? 'bg-blue-500 text-white ring-2 ring-blue-400'
                            : isUnlocked
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }
                      `}
                      title={level.title}
                    >
                      {level.id}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall progress */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>总进度</span>
          <span>{levels.filter(l => l.completed).length} / {levels.length}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{
              width: `${(levels.filter(l => l.completed).length / levels.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  )
}
