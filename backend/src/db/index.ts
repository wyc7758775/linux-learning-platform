import type BetterSqlite3 from 'better-sqlite3'
import { createDatabase } from './connection.js'
import { DB_PATH } from './dbPath.js'
import { migrateWrongRecords } from './migrations/migrateWrongRecords.js'
import { initializeSchema } from './schema.js'

const db: BetterSqlite3.Database = createDatabase(DB_PATH)

initializeSchema(db)
migrateWrongRecords(db)

export default db
