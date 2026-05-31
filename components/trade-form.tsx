"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import { MAX_NOTE_LENGTH, MIN_NOTE_LENGTH } from "@/lib/trade-limits";

type HoldingOption = {
  symbol: string;
  shares: number;
  marketValue: number;
};

type TradeFormProps = {
  initialCash: number;
  initialHoldings: HoldingOption[];
};

export function TradeForm({ initialCash, initialHoldings }: TradeFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [symbol, setSymbol] = useState("");
  const [dollars, setDollars] = useState("");
  const [note, setNote] = useState("");
  const [sellSymbol, setSellSymbol] = useState(
    initialHoldings[0]?.symbol ?? "",
  );
  const [cash, setCash] = useState(initialCash);
  const [holdings, setHoldings] = useState(initialHoldings);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function reloadPortfolio() {
    const response = await fetch("/api/portfolio");
    const data = (await response.json()) as {
      portfolio?: {
        cash: number;
        holdings: HoldingOption[];
      };
    };

    if (data.portfolio) {
      setCash(data.portfolio.cash);
      setHoldings(data.portfolio.holdings);
      if (
        data.portfolio.holdings.length > 0 &&
        !data.portfolio.holdings.some((holding) => holding.symbol === sellSymbol)
      ) {
        setSellSymbol(data.portfolio.holdings[0].symbol);
      }
    }
  }

  async function handleBuySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "buy",
          symbol,
          dollars: Number(dollars),
          note,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to log buy");
      }

      setSuccess(`Logged gut buy for ${symbol.toUpperCase()}.`);
      setSymbol("");
      setDollars("");
      setNote("");
      await reloadPortfolio();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log buy");
    } finally {
      setLoading(false);
    }
  }

  async function handleSellSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sell",
          symbol: sellSymbol,
          note,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to log sell");
      }

      setSuccess(`Logged full exit for ${sellSymbol}.`);
      setNote("");
      await reloadPortfolio();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log sell");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-heading">Log Trade</h1>
        <p className="text-foreground/80">
          Capture what you would do right now. Every trade needs a note.
        </p>
        <p className="mt-2 text-sm">
          Available cash:{" "}
          <span className="font-heading">{formatCurrency(cash)}</span>
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Gut trade</CardTitle>
          <CardDescription>
            Buys fill at the current delayed market price when you submit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "buy" | "sell")}
          >
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>

            <TabsContent value="buy">
              <form onSubmit={handleBuySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Ticker</Label>
                  <Input
                    id="symbol"
                    value={symbol}
                    onChange={(event) =>
                      setSymbol(event.target.value.toUpperCase())
                    }
                    placeholder="AAPL"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dollars">Dollar amount</Label>
                  <Input
                    id="dollars"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={dollars}
                    onChange={(event) => setDollars(event.target.value)}
                    placeholder="500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buy-note">Why this gut buy?</Label>
                  <Textarea
                    id="buy-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Earnings momentum, FOMO, conviction play..."
                    required
                    minLength={MIN_NOTE_LENGTH}
                    maxLength={MAX_NOTE_LENGTH}
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Logging buy..." : "Log gut buy"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="sell">
              {holdings.length === 0 ? (
                <p className="text-sm text-foreground/70">
                  You do not have any holdings to sell yet.
                </p>
              ) : (
                <form onSubmit={handleSellSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sell-symbol">Holding</Label>
                    <Select value={sellSymbol} onValueChange={setSellSymbol}>
                      <SelectTrigger id="sell-symbol">
                        <SelectValue placeholder="Select a holding" />
                      </SelectTrigger>
                      <SelectContent>
                        {holdings.map((holding) => (
                          <SelectItem key={holding.symbol} value={holding.symbol}>
                            {holding.symbol} (
                            {formatCurrency(holding.marketValue)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sell-note">Why exit now?</Label>
                    <Textarea
                      id="sell-note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Taking profits, thesis broke, cutting losses..."
                      required
                      minLength={MIN_NOTE_LENGTH}
                      maxLength={MAX_NOTE_LENGTH}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Logging sell..." : "Sell full position"}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          {error ? (
            <Alert className="mt-6">
              <AlertTitle>Trade rejected</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {success ? (
            <Alert className="mt-6 border-chart-4">
              <AlertTitle>Trade logged</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
