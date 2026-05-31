import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL?.trim();
const usePostgres = Boolean(databaseUrl);

export default defineConfig({
  schema: usePostgres ? "./db/schema.pg.ts" : "./db/schema.sqlite.ts",
  out: usePostgres ? "./drizzle/pg" : "./drizzle",
  dialect: usePostgres ? "postgresql" : "sqlite",
  dbCredentials: usePostgres
    ? { url: databaseUrl! }
    : { url: "./data/paperhands.db" },
});
