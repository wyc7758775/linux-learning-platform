import { NotebookGroupSection } from './NotebookGroupSection'
import { NotebookStatsBar } from './NotebookStatsBar'
import type { GroupedRecords, NotebookStats, WrongRecord } from '../types'

interface NotebookListPaneProps {
  groups: GroupedRecords[]
  isDark: boolean
  mobileShowDetail: boolean
  onArchive: (id: number) => void
  onSelectRecord: (record: WrongRecord) => void
  selectedRecordId?: number
  stats: NotebookStats
}

export function NotebookListPane({
  groups,
  isDark,
  mobileShowDetail,
  onArchive,
  onSelectRecord,
  selectedRecordId,
  stats,
}: NotebookListPaneProps) {
  return (
    <div className={`${mobileShowDetail ? 'hidden md:flex' : 'flex'} w-full md:w-[420px] lg:w-[480px] flex-shrink-0 flex-col ${
      isDark ? 'border-r border-slate-700/50' : 'border-r border-slate-200'
    }`}>
      <NotebookStatsBar isDark={isDark} stats={stats} />
      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <NotebookGroupSection
            key={group.levelId}
            group={group}
            isDark={isDark}
            onArchive={onArchive}
            onSelectRecord={onSelectRecord}
            selectedRecordId={selectedRecordId}
          />
        ))}
      </div>
    </div>
  )
}
