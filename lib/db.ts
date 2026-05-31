import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";

import * as schema from "@/db/schema";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "paperhands.db");

let dbInstance: BetterSQLite3Database<typeof schema> | null = null;

export function getDb() {
  if (!dbInstance) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    dbInstance = drizzle(sqlite, { schema });
  }

  return dbInstance;
}

export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});
