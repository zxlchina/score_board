import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { count } from "drizzle-orm";
import { categories } from "./schema";
import { getDatabasePath } from "./path";

let initialized = false;

const DEFAULT_CATEGORIES: {
  name: string;
  type: "reward" | "deduct";
  sortOrder: number;
  defaultPoints: number;
}[] = [
  { name: "完成作业", type: "reward", sortOrder: 1, defaultPoints: 10 },
  { name: "帮忙家务", type: "reward", sortOrder: 2, defaultPoints: 5 },
  { name: "表现礼貌", type: "reward", sortOrder: 3, defaultPoints: 3 },
  { name: "其他奖励", type: "reward", sortOrder: 99, defaultPoints: 5 },
  { name: "未守约定", type: "deduct", sortOrder: 1, defaultPoints: 5 },
  { name: "乱发脾气", type: "deduct", sortOrder: 2, defaultPoints: 3 },
  { name: "其他扣除", type: "deduct", sortOrder: 99, defaultPoints: 5 },
];

export function ensureDbReady(): void {
  if (initialized) return;

  const dbPath = getDatabasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite);
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });

  const [{ value: categoryCount }] = db.select({ value: count() }).from(categories).all();
  if (categoryCount === 0) {
    db.insert(categories).values(DEFAULT_CATEGORIES).run();
  }

  sqlite.close();
  initialized = true;
}
