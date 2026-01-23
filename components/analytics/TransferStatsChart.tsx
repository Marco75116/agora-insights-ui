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
import type { DailyTransferStats } from "@/types/Analytics";
import { formatCompactNumber, parseTokenAmount } from "@/lib/helpers/formatters";

interface TransferStatsChartProps {
  data: DailyTransferStats[];
  metric: "transfers" | "volume";
}

const chartConfig: ChartConfig = {
  transfers: {
    label: "Transfers",
    color: "var(--chart-1)",
  },
  volume: {
    label: "Volume",
    color: "var(--chart-2)",
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TransferStatsChart({ data, metric }: TransferStatsChartProps) {
  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    value:
      metric === "transfers" ? item.transferCount : parseTokenAmount(item.volume, AUSD_DECIMALS),
  }));

  const title = metric === "transfers" ? "Daily Transfers" : "Daily Volume";
  const dataKey = "value";
  const fillColor = metric === "transfers" ? "var(--chart-1)" : "var(--chart-2)";

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
            <Bar dataKey={dataKey} fill={fillColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
