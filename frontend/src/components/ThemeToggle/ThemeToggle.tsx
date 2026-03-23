import { useTheme } from '../../contexts/ThemeContext'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${isDark
          ? 'bg-slate-700 focus:ring-green-500 focus:ring-offset-slate-900'
          : 'bg-slate-200 focus:ring-green-500 focus:ring-offset-white'
        }
      `}
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
    >
      <span
        className={`
          absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300
          flex items-center justify-center shadow-md
          ${isDark
            ? 'left-0.5 bg-gradient-to-br from-slate-700 to-slate-800'
            : 'left-5 bg-gradient-to-br from-white to-slate-100'
          }
        `}
      >
        {isDark ? (
          <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
    </button>
  )
}
