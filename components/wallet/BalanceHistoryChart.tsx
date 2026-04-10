"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ExternalLink } from "lucide-react";
import { CHAINS, AUSD_DECIMALS } from "@/constants/chains";
import { formatCompactNumber, parseTokenAmount } from "@/lib/helpers/formatters";
import type { ChainBalanceHistory } from "@/types/WalletBalance";

interface BalanceHistoryChartProps {
  data: ChainBalanceHistory;
  walletAddress: string;
}

export function BalanceHistoryChart({ data, walletAddress }: BalanceHistoryChartProps) {
  const chain = CHAINS[data.chainId];
  const isMobile = useIsMobile();

  const chartData = data.snapshots.map((snapshot) => ({
    date: snapshot.date,
    balance: parseTokenAmount(snapshot.balance, AUSD_DECIMALS),
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
          <CardTitle className="flex items-center gap-2 text-base">
            {chain.name} Balance History
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={`${chain.explorerUrl}/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View on ${chain.name} scanner`}
                >
                  <ExternalLink className="text-muted-foreground hover:text-foreground h-4 w-4 transition-colors" />
                </a>
              </TooltipTrigger>
              <TooltipContent>View on {chain.name} scanner</TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[160px] items-center justify-center text-sm md:h-[200px]">
            No transaction history
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {chain.name} Balance History
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`${chain.explorerUrl}/address/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View on ${chain.name} scanner`}
              >
                <ExternalLink className="text-muted-foreground hover:text-foreground h-4 w-4 transition-colors" />
              </a>
            </TooltipTrigger>
            <TooltipContent>View on {chain.name} scanner</TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[160px] w-full md:h-[200px]">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: isMobile ? 0 : 12,
              right: isMobile ? 4 : 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
            />
            {!isMobile && (
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCompactNumber(value)}
                width={60}
              />
            )}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => `${formatCompactNumber(Number(value))} AUSD`}
                  labelFormatter={(_, payload) => {
                    const date = payload?.[0]?.payload?.date;
                    if (!date) return "";
                    return new Date(date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });
                  }}
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
