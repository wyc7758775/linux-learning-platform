import { useTheme } from '../../contexts/ThemeContext'
import { useWrongNotebookData } from './hooks/useWrongNotebookData'
import { getNotebookStats, groupRecordsByLevel } from './utils'
import { NotebookDetailPanel } from './components/NotebookDetailPanel'
import { NotebookEmptyState } from './components/NotebookEmptyState'
import { NotebookListPane } from './components/NotebookListPane'
import { NotebookLoadingState } from './components/NotebookLoadingState'
import type { WrongNotebookProps } from './types'

export function WrongNotebook({ levels }: WrongNotebookProps) {
  const { isDark } = useTheme()
  const {
    archiveRecord,
    loading,
    mobileShowDetail,
    openRecord,
    records,
    selectedRecord,
    setMobileShowDetail,
  } = useWrongNotebookData()

  if (loading) {
    return <NotebookLoadingState isDark={isDark} />
  }

  if (records.length === 0) {
    return <NotebookEmptyState isDark={isDark} />
  }

  const groupedRecords = groupRecordsByLevel(records, levels)
  const stats = getNotebookStats(records, groupedRecords)

  return (
    <div className="flex h-full">
      <NotebookListPane
        groups={groupedRecords}
        isDark={isDark}
        mobileShowDetail={mobileShowDetail}
        onArchive={(id) => void archiveRecord(id)}
        onSelectRecord={openRecord}
        selectedRecordId={selectedRecord?.id}
        stats={stats}
      />

      <div className={`${mobileShowDetail ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
        {selectedRecord ? (
          <NotebookDetailPanel
            isDark={isDark}
            level={levels.find((level) => level.id === selectedRecord.levelId)}
            onArchive={(id) => void archiveRecord(id)}
            onBack={() => setMobileShowDetail(false)}
            record={selectedRecord}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>选择一条记录查看详情</p>
          </div>
        )}
      </div>
    </div>
  )
}
