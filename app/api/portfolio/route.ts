import { NextRequest, NextResponse } from "next/server";

import {
  getAllTrades,
  getPortfolioSummary,
  getRecentTrades,
  getSnapshotHistory,
} from "@/lib/portfolio";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const view = searchParams.get("view");

    if (view === "history") {
      const page = Number(searchParams.get("page") ?? "1");
      const trades = await getAllTrades(page);
      return NextResponse.json({ trades });
    }

    const [portfolio, snapshots, recentTrades] = await Promise.all([
      getPortfolioSummary(),
      getSnapshotHistory(),
      getRecentTrades(10),
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
