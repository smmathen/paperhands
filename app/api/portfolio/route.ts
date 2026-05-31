import { NextRequest, NextResponse } from "next/server";

import {
  getAllTrades,
  getPortfolioSummary,
  getRecentTrades,
  getSnapshotHistory,
} from "@/lib/portfolio";
import { getUserId } from "@/lib/user";

export async function GET(request: NextRequest) {
  const userId = getUserId();

  try {
    const { searchParams } = request.nextUrl;
    const view = searchParams.get("view");

    if (view === "history") {
      const page = Number(searchParams.get("page") ?? "1");
      const trades = await getAllTrades(userId, page);
      return NextResponse.json({ trades });
    }

    const [portfolio, snapshots, recentTrades] = await Promise.all([
      getPortfolioSummary(userId),
      getSnapshotHistory(userId),
      getRecentTrades(userId, 10),
    ]);

    return NextResponse.json({
      portfolio,
      snapshots,
      recentTrades,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load portfolio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
