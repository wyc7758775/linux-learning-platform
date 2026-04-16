interface NotebookLoadingStateProps {
  isDark: boolean
}

export function NotebookLoadingState({ isDark }: NotebookLoadingStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className={`w-8 h-8 border-2 rounded-full animate-spin ${
          isDark ? 'border-slate-600 border-t-blue-400' : 'border-slate-200 border-t-blue-500'
        }`} />
        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>加载中...</span>
      </div>
    </div>
  )
}
