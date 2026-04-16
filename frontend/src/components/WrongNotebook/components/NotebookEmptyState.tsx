interface NotebookEmptyStateProps {
  isDark: boolean
}

export function NotebookEmptyState({ isDark }: NotebookEmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full px-6">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <svg className={`w-10 h-10 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>暂无错题记录</h3>
        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          继续挑战关卡吧！做错的题目会自动记录在这里，方便你回顾和巩固。
        </p>
      </div>
    </div>
  )
}
