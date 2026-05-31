import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const account = pgTable(
  "account",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().default("local-dev"),
    cash: text("cash").notNull(),
    startingBalance: text("starting_balance").notNull(),
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("account_user_id_idx").on(table.userId)],
);

export const holdings = pgTable(
  "holdings",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().default("local-dev"),
    symbol: text("symbol").notNull(),
    shares: text("shares").notNull(),
    avgCost: text("avg_cost").notNull(),
  },
  (table) => [
    uniqueIndex("holdings_user_symbol_idx").on(table.userId, table.symbol),
  ],
);

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("local-dev"),
  type: text("type").notNull(),
  symbol: text("symbol").notNull(),
  dollars: text("dollars").notNull(),
  price: text("price").notNull(),
  shares: text("shares").notNull(),
  note: text("note").notNull(),
  executedAt: timestamp("executed_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

export const portfolioSnapshots = pgTable("portfolio_snapshots", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("local-dev"),
  totalValue: text("total_value").notNull(),
  cash: text("cash").notNull(),
  holdingsValue: text("holdings_value").notNull(),
  recordedAt: timestamp("recorded_at", { mode: "date" })
    .notNull()
    .defaultNow(),
  source: text("source").notNull(),
});
