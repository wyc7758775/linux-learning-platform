import BetterSqlite3 from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data.db')
const WRONG_RECORD_ERROR_TYPES = new Set([
  'permission',
  'notfound',
  'syntax',
  'command',
  'empty',
  'logic',
])

const db: BetterSqlite3.Database = new BetterSqlite3(DB_PATH)

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    username        TEXT    NOT NULL UNIQUE,
    password_hash   TEXT    NOT NULL,
    avatar          TEXT    NOT NULL DEFAULT '😀',
    login_fail_count INTEGER NOT NULL DEFAULT 0,
    locked_until    INTEGER,
    created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_level     INTEGER NOT NULL DEFAULT 1,
    completed_levels  TEXT    NOT NULL DEFAULT '[]',
    created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at        INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(user_id)
  );

  CREATE TABLE IF NOT EXISTS wrong_records (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id    INTEGER NOT NULL,
    detail      TEXT,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch())
  );
`)

function hasColumn(tableName: string, columnName: string): boolean {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
    name: string
  }>

  return columns.some((column) => column.name === columnName)
}

function classifyWrongRecordType(detail: string | null): string {
  if (!detail) {
    return 'empty'
  }

  try {
    const parsed = JSON.parse(detail) as { command?: string; output?: string }
    const command = (parsed.command || '').trim()
    const output = (parsed.output || '').trim()

    if (!command || !output) {
      return 'empty'
    }

    if (/permission denied|are you root/i.test(output)) {
      return 'permission'
    }

    if (/no such file|not found|cannot access/i.test(output)) {
      return 'notfound'
    }

    if (/syntax error/i.test(output)) {
      return 'syntax'
    }

    if (/command not found/i.test(output)) {
      return 'command'
    }

    return 'logic'
  } catch {
    return 'logic'
  }
}

function migrateWrongRecords() {
  if (!hasColumn('wrong_records', 'error_type')) {
    db.exec(
      "ALTER TABLE wrong_records ADD COLUMN error_type TEXT NOT NULL DEFAULT 'logic'"
    )
  }

  if (!hasColumn('wrong_records', 'attempt_count')) {
    db.exec(
      'ALTER TABLE wrong_records ADD COLUMN attempt_count INTEGER NOT NULL DEFAULT 1'
    )
  }

  if (!hasColumn('wrong_records', 'archived_at')) {
    db.exec('ALTER TABLE wrong_records ADD COLUMN archived_at INTEGER')
  }

  const records = db
    .prepare(
      'SELECT id, user_id, level_id, detail, created_at, error_type, attempt_count, archived_at FROM wrong_records ORDER BY created_at DESC, id DESC'
    )
    .all() as Array<{
      id: number
      user_id: number
      level_id: number
      detail: string | null
      created_at: number
      error_type?: string | null
      attempt_count?: number | null
      archived_at?: number | null
    }>

  const updateType = db.prepare(
    'UPDATE wrong_records SET error_type = ?, attempt_count = COALESCE(attempt_count, 1) WHERE id = ?'
  )
  const mergeRecord = db.prepare(
    'UPDATE wrong_records SET attempt_count = ?, detail = ?, created_at = ?, error_type = ? WHERE id = ?'
  )
  const deleteRecord = db.prepare('DELETE FROM wrong_records WHERE id = ?')
  const transaction = db.transaction(() => {
    const grouped = new Map<
      string,
      {
        keeperId: number
        attempts: number
        detail: string | null
        createdAt: number
        errorType: string
      }
    >()

    for (const record of records) {
      const errorType = WRONG_RECORD_ERROR_TYPES.has(record.error_type || '')
        ? (record.error_type as string)
        : classifyWrongRecordType(record.detail)

      updateType.run(errorType, record.id)

      if (record.archived_at) {
        continue
      }

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
        merged.keeperId
      )
    }
  })

  transaction()

  db.exec('DROP INDEX IF EXISTS idx_wrong_records_merge')
  db.exec('DROP INDEX IF EXISTS idx_wrong_records_merge_active')
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_wrong_records_merge_active
      ON wrong_records(user_id, level_id, error_type)
      WHERE archived_at IS NULL;
  `)
}

migrateWrongRecords()

export default db
