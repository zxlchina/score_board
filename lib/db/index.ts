import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { getDatabasePath } from "./path";
import { ensureDbReady } from "./init";

export type AppDb = BetterSQLite3Database<typeof schema>;

declare global {
  var __scoreBoardSqlite: Database.Database | undefined;
  var __scoreBoardDb: AppDb | undefined;
}

function createConnection(): { sqlite: Database.Database; db: AppDb } {
  ensureDbReady();
  const dbPath = getDatabasePath();
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  return { sqlite, db };
}

export function getDb(): AppDb {
  if (process.env.NODE_ENV === "production") {
    if (!global.__scoreBoardDb) {
      const { sqlite, db } = createConnection();
      global.__scoreBoardSqlite = sqlite;
      global.__scoreBoardDb = db;
    }
    return global.__scoreBoardDb;
  }
  if (!global.__scoreBoardDb) {
    const { sqlite, db } = createConnection();
    global.__scoreBoardSqlite = sqlite;
    global.__scoreBoardDb = db;
  }
  return global.__scoreBoardDb;
}

export { schema };
