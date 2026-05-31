import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
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
  formatShares,
} from "@/lib/format";
import { getAllTrades } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const trades = await getAllTrades();

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-heading">Trade History</h1>
        <p className="text-foreground/80">
          Every gut call, with the note you wrote at the time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All trades</CardTitle>
          <CardDescription>{trades.length} logged trades</CardDescription>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <p className="text-sm text-foreground/70">
              No trades yet. Head to Log Trade when inspiration strikes.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell>{formatDate(trade.executedAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={trade.type === "buy" ? "default" : "neutral"}
                      >
                        {trade.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-heading">{trade.symbol}</TableCell>
                    <TableCell>{formatCurrency(Number(trade.dollars))}</TableCell>
                    <TableCell>{formatCurrency(Number(trade.price))}</TableCell>
                    <TableCell>{formatShares(Number(trade.shares))}</TableCell>
                    <TableCell className="max-w-xs whitespace-normal">
                      {trade.note}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
