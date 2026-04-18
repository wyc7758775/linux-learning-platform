import type BetterSqlite3 from 'better-sqlite3'
import { classifyWrongRecordType, isWrongRecordErrorType } from '../wrongRecordClassifier.js'
import { hasColumn } from './helpers.js'

interface WrongRecordRow {
  id: number
  user_id: number
  level_id: number
  detail: string | null
  created_at: number
  error_type?: string | null
  attempt_count?: number | null
  archived_at?: number | null
}

export function migrateWrongRecords(db: BetterSqlite3.Database): void {
  if (!hasColumn(db, 'wrong_records', 'error_type')) {
    db.exec("ALTER TABLE wrong_records ADD COLUMN error_type TEXT NOT NULL DEFAULT 'logic'")
  }
  if (!hasColumn(db, 'wrong_records', 'attempt_count')) {
    db.exec('ALTER TABLE wrong_records ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 1')
  }
  if (!hasColumn(db, 'wrong_records', 'archived_at')) {
    db.exec('ALTER TABLE wrong_records ADD COLUMN archived_at INTEGER')
  }

  const records = db.prepare(`
    SELECT id, user_id, level_id, detail, created_at, error_type, attempt_count, archived_at
    FROM wrong_records
    ORDER BY created_at DESC, id DESC
  `).all() as WrongRecordRow[]

  const updateType = db.prepare(
    'UPDATE wrong_records SET error_type = ?, attempt_count = COALESCE(attempt_count, 1) WHERE id = ?',
  )
  const mergeRecord = db.prepare(
    'UPDATE wrong_records SET attempt_count = ?, detail = ?, created_at = ?, error_type = ? WHERE id = ?',
  )
  const deleteRecord = db.prepare('DELETE FROM wrong_records WHERE id = ?')

  db.transaction(() => {
    const grouped = new Map<string, {
      keeperId: number
      attempts: number
      detail: string | null
      createdAt: number
      errorType: string
    }>()

    for (const record of records) {
      const errorType = isWrongRecordErrorType(record.error_type)
        ? record.error_type
        : classifyWrongRecordType(record.detail)

      updateType.run(errorType, record.id)
      if (record.archived_at) continue

      const key = `${record.user_id}:${record.level_id}:${errorType}`
      const attempts = record.attempt_count && record.attempt_count > 0 ? record.attempt_count : 1
      const current = grouped.get(key)

      if (!current) {
        grouped.set(key, {
          keeperId: record.id,
          attempts,
          detail: record.detail,
          createdAt: record.created_at,
          errorType,
        })
        continue
      }

      current.attempts += attempts
      deleteRecord.run(record.id)
    }

    for (const merged of grouped.values()) {
      mergeRecord.run(
        merged.attempts,
        merged.detail,
        merged.createdAt,
        merged.errorType,
        merged.keeperId,
      )
    }
  })()

  db.exec('DROP INDEX IF EXISTS idx_wrong_records_merge')
  db.exec('DROP INDEX IF EXISTS idx_wrong_records_merge_active')
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_wrong_records_merge_active
      ON wrong_records(user_id, level_id, error_type)
      WHERE archived_at IS NULL;
  `)
}
