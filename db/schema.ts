import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const account = sqliteTable("account", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cash: text("cash").notNull(),
  startingBalance: text("starting_balance").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const holdings = sqliteTable(
  "holdings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    symbol: text("symbol").notNull(),
    shares: text("shares").notNull(),
    avgCost: text("avg_cost").notNull(),
  },
  (table) => [uniqueIndex("holdings_symbol_idx").on(table.symbol)],
);

export const trades = sqliteTable("trades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
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
  totalValue: text("total_value").notNull(),
  cash: text("cash").notNull(),
  holdingsValue: text("holdings_value").notNull(),
  recordedAt: integer("recorded_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  source: text("source").notNull(),
});

export type Account = typeof account.$inferSelect;
export type Holding = typeof holdings.$inferSelect;
export type Trade = typeof trades.$inferSelect;
export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;
