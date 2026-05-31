import { NextResponse } from "next/server";

import {
  executeBuy,
  executeSell,
  getPortfolioSummary,
  resetAccount,
} from "@/lib/portfolio";
import { getUserId } from "@/lib/user";

export async function POST(request: Request) {
  const userId = getUserId();

  try {
    const body = (await request.json()) as {
      type?: "buy" | "sell" | "reset";
      symbol?: string;
      dollars?: number;
      note?: string;
    };

    if (body.type === "reset") {
      await resetAccount(userId);
      const portfolio = await getPortfolioSummary(userId);
      return NextResponse.json({ ok: true, portfolio });
    }

    if (body.type === "buy") {
      if (!body.symbol || body.dollars === undefined || !body.note) {
        return NextResponse.json(
          { error: "symbol, dollars, and note are required" },
          { status: 400 },
        );
      }

      const trade = await executeBuy(userId, {
        symbol: body.symbol,
        dollars: Number(body.dollars),
        note: body.note,
      });

      const portfolio = await getPortfolioSummary(userId);
      return NextResponse.json({ ok: true, trade, portfolio });
    }

    if (body.type === "sell") {
      if (!body.symbol || !body.note) {
        return NextResponse.json(
          { error: "symbol and note are required" },
          { status: 400 },
        );
      }

      const trade = await executeSell(userId, {
        symbol: body.symbol,
        note: body.note,
      });

      const portfolio = await getPortfolioSummary(userId);
      return NextResponse.json({ ok: true, trade, portfolio });
    }

    return NextResponse.json({ error: "Invalid trade type" }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to execute trade";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
