"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CHAINS, AUSD_DECIMALS } from "@/constants/chains";
import { formatCompactNumber, parseTokenAmount } from "@/lib/helpers/formatters";
import type { ChainBalanceHistory } from "@/types/WalletBalance";

interface BalanceHistoryChartProps {
  data: ChainBalanceHistory;
}

export function BalanceHistoryChart({ data }: BalanceHistoryChartProps) {
  const chain = CHAINS[data.chainId];

  const chartData = data.snapshots.map((snapshot) => ({
    blockNumber: snapshot.blockNumber,
    balance: parseTokenAmount(snapshot.totalBalance, AUSD_DECIMALS),
  }));

  const chartConfig: ChartConfig = {
    balance: {
      label: "Balance",
      color: chain.color,
    },
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{chain.name} Balance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
            No transaction history
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{chain.name} Balance History</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="blockNumber"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactNumber(value)}
              width={60}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCompactNumber(Number(value))}
                  labelFormatter={(label) => `Block ${formatCompactNumber(Number(label))}`}
                />
              }
            />
            <Area
              dataKey="balance"
              type="step"
              fill={chain.color}
              fillOpacity={0.4}
              stroke={chain.color}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
