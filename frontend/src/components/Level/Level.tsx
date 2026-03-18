import { useState, useEffect, useRef } from 'react'
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
  const prevCompletedRef = useRef(false)

  // 监听 completed 变化，触发烟花
  useEffect(() => {
    if (completed && !prevCompletedRef.current) {
      setShowFirework(true)
    }
    prevCompletedRef.current = completed
  }, [completed])

  const handleNextLevel = () => {
    setShowFirework(false) // 立即销毁烟花
    onNextLevel()
  }

  const handleFireworkComplete = () => {
    setShowFirework(false)
  }

  return (
    <>
      {/* Firework animation */}
      {showFirework && (
        <Firework onComplete={handleFireworkComplete} duration={3000} />
      )}

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-sm text-gray-400">第 {level.chapter} 章 · 关卡 {level.id}</span>
            <h2 className="text-xl font-bold text-white mt-1">{level.title}</h2>
          </div>
          {completed && (
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
              已完成
            </span>
          )}
        </div>

        <p className="text-gray-300 mb-4">{level.description}</p>

        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <code className="text-green-400 font-mono">
            目标命令: <span className="text-yellow-400">{level.command}</span>
          </code>
        </div>

        {/* Hint section */}
        <div className="mb-4">
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              需要提示? 点击查看
            </button>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400 text-sm">
                <span className="font-bold">提示:</span> {level.hint}
              </p>
            </div>
          )}
        </div>

        {/* Completion message */}
        {completed && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
            <p className="text-green-400 font-medium mb-3">
              🎉 恭喜! 你已完成这个关卡
            </p>
            {hasNextLevel && (
              <button
                onClick={handleNextLevel}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                下一关
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
