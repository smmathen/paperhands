import { desc, eq, asc } from "drizzle-orm";

import {
  account,
  holdings,
  portfolioSnapshots,
  trades,
} from "@/db/schema";
import { db } from "@/lib/db";
import { fetchQuote, fetchQuotes, normalizeSymbol } from "@/lib/finnhub";
import { MAX_NOTE_LENGTH, MIN_NOTE_LENGTH } from "@/lib/trade-limits";

export const STARTING_BALANCE = 10_000;

function normalizeNote(note: string): string {
  const trimmed = note.trim();
  if (trimmed.length < MIN_NOTE_LENGTH) {
    throw new Error(`Note must be at least ${MIN_NOTE_LENGTH} characters`);
  }
  if (trimmed.length > MAX_NOTE_LENGTH) {
    throw new Error(`Note must be at most ${MAX_NOTE_LENGTH} characters`);
  }
  return trimmed;
}

export type HoldingWithQuote = {
  symbol: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
};

export type PortfolioSummary = {
  cash: number;
  startingBalance: number;
  holdingsValue: number;
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  holdings: HoldingWithQuote[];
  quotesAsOf: string | null;
};

export type SnapshotPoint = {
  date: string;
  totalValue: number;
  source: "trade";
};

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

export async function ensureAccount() {
  const existing = await db.select().from(account).limit(1);
  if (existing.length > 0) {
    return existing[0];
  }

  const [created] = await db
    .insert(account)
    .values({
      cash: STARTING_BALANCE.toFixed(2),
      startingBalance: STARTING_BALANCE.toFixed(2),
    })
    .returning();

  await recordSnapshot();
  return created;
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const acct = await ensureAccount();
  const allHoldings = await db.select().from(holdings);

  const quotes = await fetchQuotes(allHoldings.map((h) => h.symbol));

  let holdingsValue = 0;
  let quotesAsOf: string | null = null;

  const holdingsWithQuotes: HoldingWithQuote[] = allHoldings.map((holding) => {
    const shares = toNumber(holding.shares);
    const avgCost = toNumber(holding.avgCost);
    const quote = quotes[holding.symbol];
    const currentPrice = quote?.price ?? avgCost;
    const marketValue = shares * currentPrice;
    const costBasis = shares * avgCost;
    const unrealizedPnl = marketValue - costBasis;
    const unrealizedPnlPercent =
      costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;

    holdingsValue += marketValue;

    if (quote?.fetchedAt) {
      quotesAsOf = quote.fetchedAt.toISOString();
    }

    return {
      symbol: holding.symbol,
      shares,
      avgCost,
      currentPrice,
      marketValue,
      costBasis,
      unrealizedPnl,
      unrealizedPnlPercent,
    };
  });

  const cash = toNumber(acct.cash);
  const startingBalance = toNumber(acct.startingBalance);
  const totalValue = cash + holdingsValue;
  const totalReturn = totalValue - startingBalance;
  const totalReturnPercent =
    startingBalance > 0 ? (totalReturn / startingBalance) * 100 : 0;

  return {
    cash,
    startingBalance,
    holdingsValue,
    totalValue,
    totalReturn,
    totalReturnPercent,
    holdings: holdingsWithQuotes.sort((a, b) =>
      a.symbol.localeCompare(b.symbol),
    ),
    quotesAsOf,
  };
}

export async function recordSnapshot() {
  const acct = await ensureAccount();
  const allHoldings = await db.select().from(holdings);
  const quotes = await fetchQuotes(allHoldings.map((h) => h.symbol));

  let holdingsValue = 0;
  for (const holding of allHoldings) {
    const shares = toNumber(holding.shares);
    const avgCost = toNumber(holding.avgCost);
    const price = quotes[holding.symbol]?.price ?? avgCost;
    holdingsValue += shares * price;
  }

  const cash = toNumber(acct.cash);
  const totalValue = cash + holdingsValue;

  await db.insert(portfolioSnapshots).values({
    totalValue: totalValue.toFixed(2),
    cash: cash.toFixed(2),
    holdingsValue: holdingsValue.toFixed(2),
    source: "trade",
  });
}

export async function getSnapshotHistory(): Promise<SnapshotPoint[]> {
  const rows = await db
    .select()
    .from(portfolioSnapshots)
    .orderBy(asc(portfolioSnapshots.recordedAt));

  return rows.map((row) => ({
    date: row.recordedAt.toISOString(),
    totalValue: toNumber(row.totalValue),
    source: row.source as "trade",
  }));
}

export async function executeBuy(input: {
  symbol: string;
  dollars: number;
  note: string;
}) {
  const symbol = normalizeSymbol(input.symbol);
  const note = normalizeNote(input.note);

  if (input.dollars <= 0) {
    throw new Error("Dollar amount must be greater than zero");
  }

  const acct = await ensureAccount();
  const cash = toNumber(acct.cash);

  if (input.dollars > cash) {
    throw new Error("Insufficient cash for this trade");
  }

  const quote = await fetchQuote(symbol);
  const shares = input.dollars / quote.price;

  const existing = await db
    .select()
    .from(holdings)
    .where(eq(holdings.symbol, symbol))
    .limit(1);

  if (existing.length > 0) {
    const currentShares = toNumber(existing[0].shares);
    const currentAvgCost = toNumber(existing[0].avgCost);
    const newShares = currentShares + shares;
    const newAvgCost =
      (currentShares * currentAvgCost + input.dollars) / newShares;

    await db
      .update(holdings)
      .set({
        shares: newShares.toFixed(6),
        avgCost: newAvgCost.toFixed(4),
      })
      .where(eq(holdings.symbol, symbol));
  } else {
    await db.insert(holdings).values({
      symbol,
      shares: shares.toFixed(6),
      avgCost: quote.price.toFixed(4),
    });
  }

  await db
    .update(account)
    .set({ cash: (cash - input.dollars).toFixed(2) })
    .where(eq(account.id, acct.id));

  const [trade] = await db
    .insert(trades)
    .values({
      type: "buy",
      symbol,
      dollars: input.dollars.toFixed(2),
      price: quote.price.toFixed(4),
      shares: shares.toFixed(6),
      note,
    })
    .returning();

  await recordSnapshot();
  return trade;
}

export async function executeSell(input: { symbol: string; note: string }) {
  const symbol = normalizeSymbol(input.symbol);
  const note = normalizeNote(input.note);

  const existing = await db
    .select()
    .from(holdings)
    .where(eq(holdings.symbol, symbol))
    .limit(1);

  if (existing.length === 0) {
    throw new Error(`No holding found for ${symbol}`);
  }

  const holding = existing[0];
  const shares = toNumber(holding.shares);
  const quote = await fetchQuote(symbol);
  const proceeds = shares * quote.price;

  const acct = await ensureAccount();
  const cash = toNumber(acct.cash);

  await db.delete(holdings).where(eq(holdings.symbol, symbol));

  await db
    .update(account)
    .set({ cash: (cash + proceeds).toFixed(2) })
    .where(eq(account.id, acct.id));

  const [trade] = await db
    .insert(trades)
    .values({
      type: "sell",
      symbol,
      dollars: proceeds.toFixed(2),
      price: quote.price.toFixed(4),
      shares: shares.toFixed(6),
      note,
    })
    .returning();

  await recordSnapshot();
  return trade;
}

export async function resetAccount() {
  await db.delete(trades);
  await db.delete(holdings);
  await db.delete(portfolioSnapshots);

  const acct = await ensureAccount();
  await db
    .update(account)
    .set({
      cash: STARTING_BALANCE.toFixed(2),
      startingBalance: STARTING_BALANCE.toFixed(2),
    })
    .where(eq(account.id, acct.id));

  await recordSnapshot();
}

export async function getRecentTrades(limit = 10) {
  return db
    .select()
    .from(trades)
    .orderBy(desc(trades.executedAt))
    .limit(limit);
}

export async function getAllTrades(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  return db
    .select()
    .from(trades)
    .orderBy(desc(trades.executedAt))
    .limit(pageSize)
    .offset(offset);
}
