import { AppShell } from "@/components/app-shell";
import { TradeForm } from "@/components/trade-form";
import { getPortfolioSummary } from "@/lib/portfolio";
import { getUserId } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function TradePage() {
  const portfolio = await getPortfolioSummary(getUserId());

  return (
    <AppShell>
      <TradeForm
        initialCash={portfolio.cash}
        initialHoldings={portfolio.holdings.map((holding) => ({
          symbol: holding.symbol,
          shares: holding.shares,
          marketValue: holding.marketValue,
        }))}
      />
    </AppShell>
  );
}
