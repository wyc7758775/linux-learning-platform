import type { Level } from '../../../data/levels'
import { chapterColors, chapterNames, getDefaultTagColors } from '../constants'
import { formatFullTime } from '../utils'
import { NotebookDetailContent } from './NotebookDetailContent'
import type { WrongRecord } from '../types'

interface NotebookDetailPanelProps {
  isDark: boolean
  level?: Level
  onArchive: (id: number) => void
  onBack: () => void
  record: WrongRecord
}

export function NotebookDetailPanel({
  isDark,
  level,
  onArchive,
  onBack,
  record,
}: NotebookDetailPanelProps) {
  const chapter = level?.chapter || 0
  const colors = chapterColors[chapter] || getDefaultTagColors()
  const chapterName = chapterNames[chapter] || '未知章节'

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className={`px-6 py-5 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
        <button
          onClick={onBack}
          className={`md:hidden flex items-center gap-1 text-xs mb-3 cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? `${colors.darkBg} ${colors.darkText}` : `${colors.bg} ${colors.text}`}`}>{chapterName}</span>
              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Level {record.levelId}</span>
              {record.attemptCount > 1 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-500'}`}>
                  已错 {record.attemptCount} 次
                </span>
              )}
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{level?.title || `关卡 ${record.levelId}`}</h3>
            {level?.description && <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{level.description}</p>}
          </div>
          <span className={`text-xs flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {formatFullTime(record.createdAt)}
          </span>
        </div>
      </div>

      <NotebookDetailContent isDark={isDark} record={record} />

      <div className={`px-6 py-4 border-t flex items-center justify-between ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>记录 #{record.id}</span>
        <button
          onClick={() => onArchive(record.id)}
          className={`text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            isDark ? 'text-slate-400 hover:text-amber-300 hover:bg-amber-500/10' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
          }`}
        >
          归档这条错题
        </button>
      </div>
    </div>
  )
}
