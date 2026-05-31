import Database from "better-sqlite3";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";

import * as sqliteSchema from "@/db/schema.sqlite";
import * as pgSchema from "@/db/schema.pg";

type SqliteDb = BetterSQLite3Database<typeof sqliteSchema>;

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "paperhands.db");

let dbInstance: SqliteDb | null = null;

function createDb(): SqliteDb {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    const sql = neon(databaseUrl);
    return drizzleNeon({ client: sql, schema: pgSchema }) as unknown as SqliteDb;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  return drizzleSqlite(sqlite, { schema: sqliteSchema });
}

export function getDb(): SqliteDb {
  if (!dbInstance) {
    dbInstance = createDb();
  }
  return dbInstance;
}

export const db = new Proxy({} as SqliteDb, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});

export function isPostgres(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
