"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AUSD_DECIMALS } from "@/constants/chains";
import type { DailyMintBurnStats } from "@/types/Analytics";
import { formatCompactNumber, parseTokenAmount } from "@/lib/helpers/formatters";

interface MintBurnStatsChartProps {
  data: DailyMintBurnStats[];
  metric: "mint" | "burn";
  type: "count" | "volume";
}

const chartConfig: ChartConfig = {
  mint: {
    label: "Mints",
    color: "var(--chart-3)",
  },
  burn: {
    label: "Burns",
    color: "var(--chart-4)",
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function MintBurnStatsChart({ data, metric, type }: MintBurnStatsChartProps) {
  const chartData = data.map((item) => {
    let value: number;
    if (metric === "mint") {
      value = type === "count" ? item.mintCount : parseTokenAmount(item.mintVolume, AUSD_DECIMALS);
    } else {
      value = type === "count" ? item.burnCount : parseTokenAmount(item.burnVolume, AUSD_DECIMALS);
    }
    return {
      date: formatDate(item.date),
      value,
    };
  });

  const metricLabel = metric === "mint" ? "Mints" : "Burns";
  const typeLabel = type === "count" ? "" : "Volume";
  const title = `Daily ${metricLabel}${typeLabel ? ` ${typeLabel}` : ""}`;
  const fillColor = metric === "mint" ? "var(--chart-3)" : "var(--chart-4)";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} margin={{ left: 0, right: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactNumber(value)}
              width={50}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent formatter={(value) => formatCompactNumber(Number(value))} />
              }
            />
            <Bar dataKey="value" fill={fillColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
