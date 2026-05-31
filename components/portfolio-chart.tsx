"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatChartDate, formatCurrency } from "@/lib/format";

const CHART_HEIGHT = 256;

type PortfolioChartProps = {
  data: Array<{
    date: string;
    totalValue: number;
    source: "trade";
  }>;
};

export function PortfolioChart({ data }: PortfolioChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-base border-2 border-dashed border-border text-sm text-foreground/70">
        Log a trade to start your equity curve.
      </div>
    );
  }

  return (
    <div className="rounded-base border-2 border-border bg-secondary-background p-4 shadow-shadow">
      <div className="min-w-0" style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer
          width="100%"
          height={CHART_HEIGHT}
          minWidth={0}
          initialDimension={{ width: 600, height: CHART_HEIGHT }}
        >
          <LineChart
            data={data}
            margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: "var(--border)", strokeWidth: 2 }}
              tickFormatter={formatChartDate}
              minTickGap={24}
              tick={{ fill: "var(--foreground)", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "var(--border)", strokeWidth: 2 }}
              tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
              width={48}
              tick={{ fill: "var(--foreground)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--secondary-background)",
                border: "2px solid var(--border)",
                borderRadius: "5px",
                boxShadow: "4px 4px 0 0 var(--border)",
              }}
              labelFormatter={(value) => formatChartDate(String(value))}
              formatter={(value) => [
                formatCurrency(Number(value)),
                "Account Value",
              ]}
            />
            <Line
              type="monotone"
              dataKey="totalValue"
              stroke="var(--chart-1)"
              strokeWidth={3}
              dot={{
                r: 3,
                fill: "var(--chart-active-dot)",
                stroke: "var(--border)",
                strokeWidth: 2,
              }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
