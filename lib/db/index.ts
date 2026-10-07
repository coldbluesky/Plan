import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

type Db = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as unknown as { __studyDb?: Db };

function createDb(): Db {
  // 固定放在项目根目录的 data 子目录下，便于 Docker 挂载持久化
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const sqlite = new Database(path.join(dataDir, "study.db"));
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");

  return drizzle(sqlite, { schema });
}

function getInstance(): Db {
  if (!globalForDb.__studyDb) {
    globalForDb.__studyDb = createDb();
  }
  return globalForDb.__studyDb;
}

/**
 * 懒加载的数据库句柄。
 * 用 Proxy 保持与普通 drizzle 实例一致的调用方式（`db.select()`），
 * 同时避免构建期就打 SQLite 连接（否则多 worker 并发会 database is locked）。
 */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const real = getInstance();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export { schema };
