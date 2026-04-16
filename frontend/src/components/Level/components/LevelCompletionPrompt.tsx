interface LevelCompletionPromptProps {
  hasNextLevel: boolean
  isDark: boolean
  isMobile?: boolean
  onNextLevel: () => void
}

export function LevelCompletionPrompt({
  hasNextLevel,
  isDark,
  isMobile = false,
  onNextLevel,
}: LevelCompletionPromptProps) {
  const wrapperClass = isMobile
    ? `lg:hidden sticky bottom-16 flex-shrink-0 mx-4 mb-4 rounded-2xl border px-5 py-4 backdrop-blur-md relative z-50 shadow-[0_-10px_30px_rgba(15,23,42,0.16)] ${
        isDark ? 'border-slate-700/80 bg-slate-900/92' : 'border-slate-200/90 bg-white/92'
      }`
    : `rounded-xl p-4 border ${
        isDark ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'
      } ${hasNextLevel ? 'hidden lg:block' : ''}`

  return (
    <div className={wrapperClass}>
      <div className={hasNextLevel ? 'space-y-3' : ''}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isDark ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-green-500 to-emerald-600'
          } shadow-lg shadow-green-500/25`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>太棒了！</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>你已完成这个关卡</p>
          </div>
        </div>

        {hasNextLevel && (
          <button
            onClick={onNextLevel}
            className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
              isDark
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/25'
                : 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:shadow-lg hover:shadow-green-500/25'
            }`}
          >
            继续下一关
            <svg className="inline-block w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
