import BetterSqlite3 from 'better-sqlite3'

export function createDatabase(dbPath: string): BetterSqlite3.Database {
  const db = new BetterSqlite3(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  return db
}
