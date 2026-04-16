import type { Level } from '../../data/levels'
import { chapterNames } from './constants'
import type { GroupedRecords, NotebookStats, WrongRecord } from './types'

export function formatTime(unix: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - unix
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} 天前`
  const date = new Date(unix * 1000)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export function formatFullTime(unix: number): string {
  const date = new Date(unix * 1000)
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function groupRecordsByLevel(records: WrongRecord[], levels: Level[]): GroupedRecords[] {
  const groupedMap = new Map<number, WrongRecord[]>()
  const levelMap = new Map(levels.map((level) => [level.id, level]))

  for (const record of records) {
    if (!groupedMap.has(record.levelId)) {
      groupedMap.set(record.levelId, [])
    }
    groupedMap.get(record.levelId)?.push(record)
  }

  return Array.from(groupedMap.entries()).map(([levelId, groupedRecords]) => {
    const level = levelMap.get(levelId)
    return {
      levelId,
      level,
      records: groupedRecords,
      chapterName: chapterNames[level?.chapter || 0] || '未知章节',
    }
  })
}

export function getNotebookStats(records: WrongRecord[], groups: GroupedRecords[]): NotebookStats {
  const latestRecord = records.reduce<WrongRecord | null>(
    (latest, record) => (!latest || record.createdAt > latest.createdAt ? record : latest),
    null,
  )

  return {
    total: records.length,
    levels: groups.length,
    latestTime: latestRecord ? formatTime(latestRecord.createdAt) : '-',
    chapters: new Set(groups.map((group) => group.level?.chapter).filter(Boolean)).size,
  }
}
