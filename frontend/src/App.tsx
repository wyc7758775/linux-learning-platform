import { useState, useEffect } from 'react'
import { Level } from './components/Level/Level'
import { Terminal } from './components/Terminal/Terminal'
import { Progress } from './components/Progress/Progress'
import { socket, connectSocket } from './services/socket'
import type { Level as LevelType } from './levels'

const LEVELS: LevelType[] = [
  {
    id: 1,
    chapter: 1,
    title: '你好，终端',
    description: '使用 ls 命令查看当前目录的内容',
    hint: '输入 ls 然后按回车键',
    command: 'ls',
    validation: {
      type: 'command',
      expected: 'ls'
    },
    completed: false
  },
  {
    id: 2,
    chapter: 1,
    title: '我在哪里',
    description: '使用 pwd 命令查看当前工作目录',
    hint: 'pwd 是 print working directory 的缩写',
    command: 'pwd',
    validation: {
      type: 'output_contains',
      expected: '/home/player'
    },
    completed: false
  },
  {
    id: 3,
    chapter: 1,
    title: '切换目录',
    description: '使用 cd 命令进入 home 目录',
    hint: '输入 cd ~ 或 cd /home/player',
    command: 'cd',
    validation: {
      type: 'command',
      expected: 'cd'
    },
    completed: false
  },
  {
    id: 4,
    chapter: 1,
    title: '清空屏幕',
    description: '使用 clear 命令清空终端屏幕',
    hint: '输入 clear 来清理屏幕',
    command: 'clear',
    validation: {
      type: 'command',
      expected: 'clear'
    },
    completed: false
  },
  {
    id: 5,
    chapter: 1,
    title: '命令历史',
    description: '使用 history 命令查看之前执行过的命令',
    hint: 'history 命令可以显示你输入过的所有命令',
    command: 'history',
    validation: {
      type: 'command',
      expected: 'history'
    },
    completed: false
  }
]

function App() {
  const [currentLevel, setCurrentLevel] = useState<number>(() => {
    const saved = localStorage.getItem('linux-learning-current-level')
    return saved ? parseInt(saved, 10) : 1
  })
  const [levels, setLevels] = useState<LevelType[]>(() => {
    const savedProgress = localStorage.getItem('linux-learning-progress')
    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      return LEVELS.map(level => ({
        ...level,
        completed: progress.completedLevels?.includes(level.id) || false
      }))
    }
    return LEVELS
  })
  const [sessionId, setSessionId] = useState<string>('')
  const [connected, setConnected] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)

  useEffect(() => {
    // 保存当前关卡到 localStorage
    localStorage.setItem('linux-learning-current-level', String(currentLevel))
  }, [currentLevel])

  useEffect(() => {
    // Connect to socket
    connectSocket()

    socket.on('connect', () => {
      setConnected(true)
      console.log('Connected to server')
    })

    socket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from server')
    })

    socket.on('session:created', (id: string) => {
      setSessionId(id)
    })

    socket.on('level:completed', (data: { levelId: number }) => {
      const completedLevelId = data.levelId
      setLevelCompleted(true)
      setLevels(prev => {
        const updated = prev.map(level =>
          level.id === completedLevelId ? { ...level, completed: true } : level
        )
        // Save progress
        const completedLevels = updated.filter(l => l.completed).map(l => l.id)
        localStorage.setItem('linux-learning-progress', JSON.stringify({ completedLevels }))
        return updated
      })
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('session:created')
      socket.off('level:completed')
    }
  }, [])

  useEffect(() => {
    // Request session for current level when connected
    if (connected && currentLevel) {
      socket.emit('session:create', { levelId: currentLevel })
    }
  }, [connected, currentLevel])

  const handleNextLevel = () => {
    if (currentLevel < levels.length) {
      setLevelCompleted(false)
      setCurrentLevel(prev => prev + 1)
    }
  }

  const handleSelectLevel = (levelId: number) => {
    // Only allow selecting unlocked levels
    const level = levels.find(l => l.id === levelId)
    if (level && (level.id === 1 || levels.find(l => l.id === levelId - 1)?.completed)) {
      setLevelCompleted(false)
      setCurrentLevel(levelId)
    }
  }

  const activeLevel = levels.find(l => l.id === currentLevel)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-green-400">
            Linux 命令行学习平台
          </h1>
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-2 ${connected ? 'text-green-400' : 'text-red-400'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></span>
              {connected ? '已连接' : '未连接'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Level selection and content */}
          <div className="lg:w-1/3 space-y-6">
            <Progress
              levels={levels}
              currentLevel={currentLevel}
              onSelectLevel={handleSelectLevel}
            />
            {activeLevel && (
              <Level
                level={activeLevel}
                completed={levelCompleted}
                onNextLevel={handleNextLevel}
                hasNextLevel={currentLevel < levels.length}
              />
            )}
          </div>

          {/* Right side - Terminal (sticky on desktop) */}
          <div className="lg:w-2/3 lg:sticky lg:top-6 lg:self-start">
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col"
                 style={{ height: 'calc(100vh - 120px)' }}>
              <div className="bg-gray-700 px-4 py-2 flex items-center gap-2 shrink-0">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="ml-2 text-sm text-gray-400">Terminal</span>
              </div>
              <Terminal
                sessionId={sessionId}
                levelId={currentLevel}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
