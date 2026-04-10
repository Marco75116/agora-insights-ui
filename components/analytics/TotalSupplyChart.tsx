"use client";

import { useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AUSD_DECIMALS, CHAINS, SUPPORTED_CHAIN_IDS, type ChainId } from "@/constants/chains";
import type { DailyTotalSupply } from "@/types/Analytics";
import { formatCompactNumber, formatNumber, parseTokenAmount } from "@/lib/helpers/formatters";

const MONTH_OPTIONS = [
  { value: "1", label: "Last month" },
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
];

interface TotalSupplyChartProps {
  supplyData: DailyTotalSupply[];
  chainId: ChainId;
  months: number;
}

function getChartConfig(chainId: ChainId): ChartConfig {
  const chainColor = CHAINS[chainId].color;

  return {
    totalSupply: {
      label: "Total Supply",
      color: chainColor,
    },
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
  payload: {
    rawDate: string;
    totalSupply: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  chainId: ChainId;
}

function CustomTooltip({ active, payload, chainId }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const chainColor = CHAINS[chainId].color;
  const chainName = CHAINS[chainId].name;

  return (
    <div className="border-border/50 bg-background rounded-lg border px-3 py-2.5 shadow-xl">
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-muted-foreground text-xs">{formatFullDate(data.rawDate)}</span>
        <span className="text-muted-foreground text-xs">{chainName}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: chainColor }}
            />
            <span className="text-muted-foreground text-sm">Total Supply</span>
          </div>
          <span className="text-foreground font-mono text-sm font-medium tabular-nums">
            {formatNumber(data.totalSupply)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TotalSupplyChart({ supplyData, chainId, months }: TotalSupplyChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const chartConfig = useMemo(() => getChartConfig(chainId), [chainId]);
  const chainColor = CHAINS[chainId].color;

  const chartData = supplyData.map((item) => ({
    date: formatDate(item.date),
    rawDate: item.date,
    totalSupply: parseTokenAmount(item.totalSupply, AUSD_DECIMALS),
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Total Supply</CardTitle>
            <CardDescription>Daily AUSD total supply</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={months.toString()} onValueChange={(v) => updateParam("supplyMonths", v)}>
              <SelectTrigger className="h-8 w-[140px]" aria-label="Select time period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={chainId.toString()}
              onValueChange={(v) => updateParam("supplyChainId", v)}
            >
              <SelectTrigger className="h-8 w-[140px]" aria-label="Select chain">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAIN_IDS.map((id) => (
                  <SelectItem key={id} value={id.toString()}>
                    {CHAINS[id].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={chartData} margin={{ left: 0, right: 12 }}>
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
            <ChartTooltip content={<CustomTooltip chainId={chainId} />} />
            <Area
              dataKey="totalSupply"
              type="monotone"
              fill={chainColor}
              fillOpacity={0.2}
              stroke={chainColor}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
