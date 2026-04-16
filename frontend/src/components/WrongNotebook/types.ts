import type { Level } from '../../data/levels'
import type { ErrorType } from '../../utils/classifyError'

export interface WrongNotebookProps {
  levels: Level[]
}

export interface WrongRecordDetail {
  command: string
  output: string
  hint: string
}

export interface WrongRecord {
  id: number
  levelId: number
  detail: WrongRecordDetail | null
  errorType: ErrorType
  attemptCount: number
  createdAt: number
}

export interface GroupedRecords {
  levelId: number
  level?: Level
  records: WrongRecord[]
  chapterName: string
}

export interface NotebookStats {
  total: number
  levels: number
  latestTime: string
  chapters: number
}
