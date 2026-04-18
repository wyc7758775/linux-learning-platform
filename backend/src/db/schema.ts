import type BetterSqlite3 from 'better-sqlite3'

export function initializeSchema(db: BetterSqlite3.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      username         TEXT    NOT NULL UNIQUE,
      password_hash    TEXT    NOT NULL,
      avatar           TEXT    NOT NULL DEFAULT '😀',
      login_fail_count INTEGER NOT NULL DEFAULT 0,
      locked_until     INTEGER,
      created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      current_level    INTEGER NOT NULL DEFAULT 1,
      completed_levels TEXT    NOT NULL DEFAULT '[]',
      created_at       INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at       INTEGER NOT NULL DEFAULT (unixepoch()),
      UNIQUE(user_id)
    );

    CREATE TABLE IF NOT EXISTS wrong_records (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      level_id   INTEGER NOT NULL,
      detail     TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `)
}
