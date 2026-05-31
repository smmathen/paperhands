import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { PortfolioChart } from "@/components/portfolio-chart";
import { ResetDialog } from "@/components/reset-dialog";
import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatDate,
  formatPercent,
  formatShares,
} from "@/lib/format";
import {
  getPortfolioSummary,
  getRecentTrades,
  getSnapshotHistory,
} from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [portfolio, snapshots, recentTrades] = await Promise.all([
    getPortfolioSummary(),
    getSnapshotHistory(),
    getRecentTrades(10),
  ]);

  const returnTone =
    portfolio.totalReturn >= 0 ? "positive" : ("negative" as const);

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading">Dashboard</h1>
          <p className="text-foreground/80">
            What your gut would be worth if you always pulled the trigger.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/trade">Log a gut trade</Link>
          </Button>
          <ResetDialog />
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Account Value"
          value={formatCurrency(portfolio.totalValue)}
          subtitle={
            portfolio.quotesAsOf
              ? `Prices as of ${formatDate(portfolio.quotesAsOf)}`
              : undefined
          }
        />
        <StatCard
          title="Cash"
          value={formatCurrency(portfolio.cash)}
          subtitle="Available to deploy"
        />
        <StatCard
          title="Holdings Value"
          value={formatCurrency(portfolio.holdingsValue)}
          subtitle={`${portfolio.holdings.length} open positions`}
        />
        <StatCard
          title="Total Return"
          value={formatCurrency(portfolio.totalReturn)}
          subtitle={formatPercent(portfolio.totalReturnPercent)}
          tone={returnTone}
        />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
          <CardDescription>
            Updates whenever you log a trade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioChart data={snapshots} />
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
            <CardDescription>Open positions and unrealized P&amp;L.</CardDescription>
          </CardHeader>
          <CardContent>
            {portfolio.holdings.length === 0 ? (
              <p className="text-sm text-foreground/70">
                No holdings yet. Log your first gut buy to get started.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>P&amp;L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.holdings.map((holding) => (
                    <TableRow key={holding.symbol}>
                      <TableCell className="font-heading">
                        {holding.symbol}
                      </TableCell>
                      <TableCell>{formatShares(holding.shares)}</TableCell>
                      <TableCell>
                        {formatCurrency(holding.marketValue)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            holding.unrealizedPnl >= 0 ? "default" : "neutral"
                          }
                        >
                          {formatCurrency(holding.unrealizedPnl)} (
                          {formatPercent(holding.unrealizedPnlPercent)})
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Your latest gut calls.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTrades.length === 0 ? (
              <p className="text-sm text-foreground/70">
                No trades logged yet.
              </p>
            ) : (
              <div className="space-y-4">
                {recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="rounded-base border-2 border-border bg-secondary-background p-4 shadow-shadow"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={trade.type === "buy" ? "default" : "neutral"}
                        >
                          {trade.type.toUpperCase()}
                        </Badge>
                        <span className="font-heading">{trade.symbol}</span>
                      </div>
                      <span className="text-sm text-foreground/70">
                        {formatDate(trade.executedAt)}
                      </span>
                    </div>
                    <p className="text-sm">
                      {formatCurrency(Number(trade.dollars))} at{" "}
                      {formatCurrency(Number(trade.price))}
                    </p>
                    <p className="mt-2 text-sm text-foreground/80">
                      {trade.note}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
