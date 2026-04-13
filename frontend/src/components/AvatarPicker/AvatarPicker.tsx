import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import { ThemeToggle } from '../ThemeToggle/ThemeToggle'

const EMOJI_LIST = [
  '😀', '😎', '🤓', '🧑‍💻', '🐱', '🐶', '🦊', '🐼', '🦁', '🐯',
  '🐸', '🐵', '🦄', '🐲', '🦋', '🐢', '🐙', '🦀', '🐝', '🐞',
  '🦈', '🐬', '🐳', '🦉', '🦅', '🐧', '🦜', '🐺', '🐻', '🐨',
  '🎭', '🎨', '🎯', '🎲', '🎵', '🎸', '🏆', '💎', '🔥', '⭐',
  '🌈', '☀️', '🌙', '❄️', '🌸', '🌻', '🍀', '🎃', '👻', '🎅',
  '🤖', '👾', '🎮', '🚀', '💡', '🔑', '📦', '🛡️', '⚔️', '🧩',
]

interface AvatarPickerProps {
  currentAvatar: string
  onPick?: (emoji: string) => void
}

export function AvatarPicker({ currentAvatar, onPick }: AvatarPickerProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'menu' | 'avatars'>('menu')
  const ref = useRef<HTMLDivElement>(null)
  const { isDark } = useTheme()
  const { updateAvatar, logout } = useAuth()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setView('menu')
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const toggleOpen = () => {
    setOpen(prev => {
      const next = !prev
      if (next) {
        setView('menu')
      }
      return next
    })
  }

  const handleSelect = async (emoji: string) => {
    try {
      await api.put('/user/avatar', { avatar: emoji })
      updateAvatar(emoji)
      onPick?.(emoji)
    } catch {
      // Ignore avatar update failures
    }
    setOpen(false)
    setView('menu')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className={`group relative flex h-8 w-8 items-center justify-center rounded-full border text-base shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/60 focus:ring-offset-2 sm:h-9 sm:w-9 sm:text-lg ${
          isDark
            ? 'border-slate-600 bg-slate-800/80 hover:border-green-500 hover:bg-slate-800 focus:ring-offset-slate-900'
            : 'border-slate-300 bg-white hover:border-green-500 hover:bg-slate-50 focus:ring-offset-white'
        }`}
        title="打开账号菜单"
      >
        <span className="leading-none transition-transform duration-200 group-hover:scale-105">
          {currentAvatar}
        </span>
      </button>

      {open && (
        <div className={`absolute top-full mt-2 right-0 rounded-2xl border shadow-2xl z-50 overflow-hidden ${
          view === 'menu' ? 'w-60' : 'w-72'
        } ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          {view === 'menu' ? (
            <div className="p-2">
              <button
                onClick={() => setView('avatars')}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/60 ${
                  isDark
                    ? 'text-slate-200 hover:bg-slate-700 focus:ring-offset-slate-800'
                    : 'text-slate-700 hover:bg-slate-100 focus:ring-offset-white'
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${
                  isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'
                }`}>
                  {currentAvatar}
                </span>
                <span>更换头像</span>
              </button>
              <div
                className={`mt-1 flex items-center justify-between rounded-xl px-3 py-2.5 ${
                  isDark ? 'bg-slate-700/60' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    isDark ? 'bg-slate-800 text-amber-300' : 'bg-white text-amber-500 shadow-sm'
                  }`}>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      {isDark ? (
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      ) : (
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}>
                      主题
                    </p>
                    <p className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {isDark ? '深色模式' : '浅色模式'}
                    </p>
                  </div>
                </div>
                <ThemeToggle />
              </div>
              <button
                onClick={logout}
                className={`mt-1 w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/60 ${
                  isDark
                    ? 'text-red-300 hover:bg-red-500/10 focus:ring-offset-slate-800'
                    : 'text-red-600 hover:bg-red-50 focus:ring-offset-white'
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  isDark ? 'bg-red-500/10 text-red-300' : 'bg-red-50 text-red-500'
                }`}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
                  </svg>
                </span>
                <span>退出登录</span>
              </button>
            </div>
          ) : (
            <div className="p-3">
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={() => setView('menu')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/60 ${
                    isDark
                      ? 'text-slate-300 hover:bg-slate-700 focus:ring-offset-slate-800'
                      : 'text-slate-600 hover:bg-slate-100 focus:ring-offset-white'
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  返回
                </button>
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  选择头像
                </p>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSelect(emoji)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-base transition-transform focus:outline-none focus:ring-2 focus:ring-green-500/60 ${
                      emoji === currentAvatar
                        ? isDark ? 'bg-green-500/20 ring-1 ring-green-500 hover:scale-110' : 'bg-green-50 ring-1 ring-green-400 hover:scale-110'
                        : isDark ? 'hover:bg-slate-700 hover:scale-110 focus:ring-offset-slate-800' : 'hover:bg-slate-100 hover:scale-110 focus:ring-offset-white'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
