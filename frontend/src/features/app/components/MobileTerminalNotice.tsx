interface MobileTerminalNoticeProps {
  isDark: boolean
}

export function MobileTerminalNotice({ isDark }: MobileTerminalNoticeProps) {
  return (
    <div className="lg:hidden shrink-0">
      <button
        className={`w-full py-3 text-sm font-medium flex items-center justify-center gap-2 ${
          isDark ? 'bg-slate-800 text-white border-t border-slate-700' : 'bg-white text-slate-900 border-t border-slate-200'
        }`}
        onClick={() => {
          alert('移动端终端暂未完全适配，请使用桌面端获得最佳体验')
        }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        打开终端
      </button>
    </div>
  )
}
