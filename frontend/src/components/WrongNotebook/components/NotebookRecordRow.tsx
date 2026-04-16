import { formatTime } from '../utils'
import type { WrongRecord } from '../types'

interface NotebookRecordRowProps {
  isDark: boolean
  isSelected: boolean
  onArchive: (id: number) => void
  onSelect: () => void
  record: WrongRecord
}

export function NotebookRecordRow({
  isDark,
  isSelected,
  onArchive,
  onSelect,
  record,
}: NotebookRecordRowProps) {
  return (
    <div className="group relative">
      <button
        onClick={onSelect}
        className={`w-full text-left px-5 py-3 pr-14 flex items-start gap-3 transition-colors cursor-pointer border-l-2 ${
          isSelected
            ? isDark ? 'bg-slate-800/80 border-blue-500' : 'bg-blue-50/80 border-blue-500'
            : isDark ? 'border-transparent hover:bg-slate-800/40' : 'border-transparent hover:bg-slate-50'
        }`}
      >
        <div className={`w-6 h-6 rounded-md flex items-center justify-center mt-0.5 flex-shrink-0 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
          <svg className={`w-3.5 h-3.5 ${isDark ? 'text-red-400' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <code className={`text-xs font-mono block truncate ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            $ {record.detail?.command || '(空)'}
          </code>
          <div className={`text-[10px] mt-1 truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {record.detail?.output?.slice(0, 60) || '无输出'}
          </div>
        </div>

        <div className="flex items-start gap-2 flex-shrink-0">
          {record.attemptCount > 1 && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-0.5 ${
              isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'
            }`}>
              {record.attemptCount}次
            </span>
          )}
          <span className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            {formatTime(record.createdAt)}
          </span>
        </div>
      </button>

      <button
        onClick={(event) => {
          event.stopPropagation()
          onArchive(record.id)
        }}
        className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto ${
          isDark ? 'bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10' : 'bg-white text-slate-400 hover:text-amber-600 hover:bg-amber-50 shadow-sm'
        }`}
        title="归档这条错题"
        aria-label="归档这条错题"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.25 6.375H3.75m16.5 0-1.125 11.25a2.25 2.25 0 01-2.239 2.025H7.114a2.25 2.25 0 01-2.239-2.025L3.75 6.375m16.5 0-1.286-1.543A2.25 2.25 0 0017.236 4H6.764a2.25 2.25 0 00-1.728.832L3.75 6.375m8.25 3v4.5m0 0 1.875-1.875M12 13.875 10.125 12" />
        </svg>
      </button>
    </div>
  )
}
