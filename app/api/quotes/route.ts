import { NextRequest, NextResponse } from "next/server";

import { fetchQuote } from "@/lib/finnhub";

export async function GET(request: NextRequest) {
  try {
    const symbol = request.nextUrl.searchParams.get("symbol");
    if (!symbol) {
      return NextResponse.json(
        { error: "symbol query param is required" },
        { status: 400 },
      );
    }

    const quote = await fetchQuote(symbol);
    return NextResponse.json({ quote });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch quote";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
