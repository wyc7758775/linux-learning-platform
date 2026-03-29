import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

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
  const ref = useRef<HTMLDivElement>(null)
  const { isDark } = useTheme()
  const { updateAvatar } = useAuth()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSelect = async (emoji: string) => {
    try {
      await api.put('/user/avatar', { avatar: emoji })
      updateAvatar(emoji)
      onPick?.(emoji)
    } catch {
      // Ignore avatar update failures
    }
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-xl border-2 transition-colors ${
          isDark ? 'border-slate-600 hover:border-green-500' : 'border-slate-300 hover:border-green-500'
        }`}
        title="更换头像"
      >
        {currentAvatar}
      </button>

      {open && (
        <div className={`absolute top-full mt-2 right-0 p-3 rounded-xl border shadow-2xl z-50 w-72 ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            选择头像
          </p>
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSelect(emoji)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-base hover:scale-125 transition-transform ${
                  emoji === currentAvatar
                    ? isDark ? 'bg-green-500/20 ring-1 ring-green-500' : 'bg-green-50 ring-1 ring-green-400'
                    : isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
