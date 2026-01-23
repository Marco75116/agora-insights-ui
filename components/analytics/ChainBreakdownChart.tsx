"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CHAINS, SUPPORTED_CHAIN_IDS, AUSD_DECIMALS } from "@/constants/chains";
import type { ChainMetrics } from "@/types/Analytics";
import { formatCompactNumber, parseTokenAmount } from "@/lib/helpers/formatters";

interface ChainBreakdownChartProps {
  data: ChainMetrics[];
  metric: "supply" | "holders";
}

export function ChainBreakdownChart({ data, metric }: ChainBreakdownChartProps) {
  const chartData = SUPPORTED_CHAIN_IDS.map((chainId) => {
    const chainMetrics = data.find((d) => d.chainId === chainId);
    const chain = CHAINS[chainId];
    return {
      name: chain.shortName,
      value:
        metric === "supply"
          ? parseTokenAmount(chainMetrics?.totalSupply ?? "0", AUSD_DECIMALS)
          : (chainMetrics?.holdersCount ?? 0),
    };
  });

  const chartConfig: ChartConfig = SUPPORTED_CHAIN_IDS.reduce((acc, chainId) => {
    const chain = CHAINS[chainId];
    acc[chain.shortName] = {
      label: chain.name,
      color: chain.color,
    };
    return acc;
  }, {} as ChartConfig);

  chartConfig.value = {
    label: metric === "supply" ? "Supply" : "Holders",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {metric === "supply" ? "Supply by Chain" : "Holders by Chain"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" tickFormatter={(value) => formatCompactNumber(value)} />
            <YAxis type="category" dataKey="name" width={40} tickLine={false} axisLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent formatter={(value) => formatCompactNumber(Number(value))} />
              }
            />
            <Bar dataKey="value" radius={4} fill="var(--chart-1)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
