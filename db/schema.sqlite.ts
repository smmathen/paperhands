import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const account = sqliteTable(
  "account",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().default("local-dev"),
    cash: text("cash").notNull(),
    startingBalance: text("starting_balance").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("account_user_id_idx").on(table.userId)],
);

export const holdings = sqliteTable(
  "holdings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull().default("local-dev"),
    symbol: text("symbol").notNull(),
    shares: text("shares").notNull(),
    avgCost: text("avg_cost").notNull(),
  },
  (table) => [
    uniqueIndex("holdings_user_symbol_idx").on(table.userId, table.symbol),
  ],
);

export const trades = sqliteTable("trades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("local-dev"),
  type: text("type").notNull(),
  symbol: text("symbol").notNull(),
  dollars: text("dollars").notNull(),
  price: text("price").notNull(),
  shares: text("shares").notNull(),
  note: text("note").notNull(),
  executedAt: integer("executed_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const portfolioSnapshots = sqliteTable("portfolio_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("local-dev"),
  totalValue: text("total_value").notNull(),
  cash: text("cash").notNull(),
  holdingsValue: text("holdings_value").notNull(),
  recordedAt: integer("recorded_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  source: text("source").notNull(),
});
