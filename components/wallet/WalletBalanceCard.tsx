"use client";

import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CHAINS, AUSD_DECIMALS, SUPPORTED_CHAIN_IDS, type ChainId } from "@/constants/chains";
import { formatCompactNumber, parseTokenAmount, formatTokenAmount } from "@/lib/helpers/formatters";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceData {
  chainId: ChainId;
  balance: string;
}

interface WalletBalanceCardProps {
  balances: BalanceData[];
  isLoading: boolean;
}

const chartConfig: ChartConfig = Object.fromEntries(
  SUPPORTED_CHAIN_IDS.map((chainId) => [
    CHAINS[chainId].tag,
    {
      label: CHAINS[chainId].name,
      color: CHAINS[chainId].color,
    },
  ])
);

function RowSkeleton() {
  return (
    <div className="flex items-center justify-between py-2.5">
      <Skeleton className="h-4 w-20" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function WalletBalanceCard({ balances, isLoading }: WalletBalanceCardProps) {
  const resolvedBalances =
    balances.length > 0
      ? balances
      : SUPPORTED_CHAIN_IDS.map((chainId) => ({ chainId, balance: "0" }));

  const chartData = SUPPORTED_CHAIN_IDS.map((chainId) => {
    const found = resolvedBalances.find((b) => b.chainId === chainId);
    const config = CHAINS[chainId];
    return {
      chainId,
      chain: config.tag,
      name: config.name,
      shortName: config.shortName,
      value: found ? parseTokenAmount(found.balance, AUSD_DECIMALS) : 0,
      rawBalance: found?.balance ?? "0",
      fill: config.color,
    };
  });

  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          AUSD Balances
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="w-full shrink-0 md:w-[200px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Skeleton className="h-[160px] w-[160px] rounded-full" />
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        nameKey="chain"
                        formatter={(value, _name, item) => {
                          const rawBalance = item?.payload?.rawBalance;
                          const pct =
                            totalValue > 0 ? ((Number(value) / totalValue) * 100).toFixed(1) : "0";
                          const formatted = rawBalance
                            ? formatTokenAmount(rawBalance, AUSD_DECIMALS)
                            : formatCompactNumber(Number(value));
                          return `${formatted} AUSD (${pct}%)`;
                        }}
                        hideLabel
                      />
                    }
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="chain"
                    innerRadius={50}
                    strokeWidth={2}
                    stroke="var(--color-background)"
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {formatCompactNumber(totalValue)}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy ?? 0) + 20}
                                className="fill-muted-foreground text-xs"
                              >
                                AUSD
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </div>
          <div className="w-full min-w-0 flex-1">
            <div className="text-muted-foreground flex items-center justify-between border-b pb-2 text-xs">
              <span>Chain</span>
              <div className="flex items-center gap-4">
                <span>Balance</span>
                <span className="w-12 text-right">Share</span>
              </div>
            </div>
            <div className="divide-y">
              {isLoading
                ? SUPPORTED_CHAIN_IDS.map((chainId) => <RowSkeleton key={chainId} />)
                : chartData.map((item) => {
                    const isZero = item.value === 0;
                    const pct =
                      totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={item.chainId} className="flex items-center justify-between py-2.5">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: item.fill }}
                            aria-hidden="true"
                          />
                          <span className="truncate text-sm font-medium">{item.name}</span>
                          <span className="text-muted-foreground hidden text-xs sm:inline">
                            {item.shortName}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 pl-2 sm:gap-4">
                          <span
                            className={`font-mono text-xs tabular-nums sm:text-sm ${isZero ? "text-muted-foreground" : ""}`}
                          >
                            {formatTokenAmount(item.rawBalance, AUSD_DECIMALS)}
                          </span>
                          <span
                            className={`w-12 text-right font-mono text-xs tabular-nums sm:text-sm ${isZero ? "text-muted-foreground" : ""}`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
