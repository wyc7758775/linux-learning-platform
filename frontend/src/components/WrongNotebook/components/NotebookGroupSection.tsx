import { chapterColors, getDefaultTagColors } from '../constants'
import { NotebookRecordRow } from './NotebookRecordRow'
import type { GroupedRecords, WrongRecord } from '../types'

interface NotebookGroupSectionProps {
  group: GroupedRecords
  isDark: boolean
  onArchive: (id: number) => void
  onSelectRecord: (record: WrongRecord) => void
  selectedRecordId?: number
}

export function NotebookGroupSection({
  group,
  isDark,
  onArchive,
  onSelectRecord,
  selectedRecordId,
}: NotebookGroupSectionProps) {
  const colors = chapterColors[group.level?.chapter || 0] || getDefaultTagColors()

  return (
    <div>
      <div className={`sticky top-0 px-5 py-2.5 flex items-center gap-2 ${isDark ? 'bg-slate-900/90 backdrop-blur-sm' : 'bg-slate-50/90 backdrop-blur-sm'}`}>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isDark ? `${colors.darkBg} ${colors.darkText}` : `${colors.bg} ${colors.text}`}`}>
          {group.chapterName}
        </span>
        <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Level {group.levelId} · {group.level?.title || `关卡 ${group.levelId}`}
        </span>
        <span className={`text-[10px] ml-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {group.records.length} 条
        </span>
      </div>

      {group.records.map((record) => (
        <NotebookRecordRow
          key={record.id}
          isDark={isDark}
          isSelected={selectedRecordId === record.id}
          onArchive={onArchive}
          onSelect={() => onSelectRecord(record)}
          record={record}
        />
      ))}
    </div>
  )
}
