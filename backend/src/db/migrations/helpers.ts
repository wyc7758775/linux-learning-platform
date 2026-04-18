import type BetterSqlite3 from 'better-sqlite3'

export function hasColumn(
  db: BetterSqlite3.Database,
  tableName: string,
  columnName: string,
): boolean {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
    name: string
  }>

  return columns.some((column) => column.name === columnName)
}
