"use client";

import { Suspense } from "react";
import { useAusdMetrics } from "@/hooks/useAusdMetrics";
import { MetricCard } from "@/components/analytics/MetricCard";
import { MetricCardSkeleton } from "@/components/analytics/MetricCardSkeleton";
import { ChainBreakdownChart } from "@/components/analytics/ChainBreakdownChart";
import { TransferStatsSection } from "@/components/analytics/TransferStatsSection";
import { CHAINS, AUSD_DECIMALS } from "@/constants/chains";
import { formatTokenAmount, formatNumber } from "@/lib/helpers/formatters";
import { Coins, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

function TransferStatsFallback() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-[160px]" />
        <Skeleton className="h-10 w-[160px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

export default function AusdAnalyticsPage() {
  const { data, isLoading, error } = useAusdMetrics();

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Failed to load metrics: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">AUSD Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Overview of AUSD token metrics across supported chains
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Total Supply"
              value={formatTokenAmount(data?.totalSupplyAcrossChains ?? "0", AUSD_DECIMALS)}
              subtitle="Across all chains"
              icon={<Coins className="text-muted-foreground h-4 w-4" />}
            />
            <MetricCard
              title="Total Holders"
              value={formatNumber(data?.totalHoldersAcrossChains ?? 0)}
              subtitle="Unique addresses"
              icon={<Users className="text-muted-foreground h-4 w-4" />}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
          : data?.chainBreakdown.map((chain) => {
              const config = CHAINS[chain.chainId];
              return (
                <MetricCard
                  key={chain.chainId}
                  title={`${config.name} Supply`}
                  value={formatTokenAmount(chain.totalSupply, AUSD_DECIMALS)}
                  subtitle={`${formatNumber(chain.holdersCount)} holders`}
                />
              );
            })}
      </div>

      {!isLoading && data && (
        <div className="grid gap-4 md:grid-cols-2">
          <ChainBreakdownChart data={data.chainBreakdown} metric="supply" />
          <ChainBreakdownChart data={data.chainBreakdown} metric="holders" />
        </div>
      )}

      <Suspense fallback={<TransferStatsFallback />}>
        <TransferStatsSection />
      </Suspense>

      {data?.lastUpdated && (
        <p className="text-muted-foreground text-xs">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  );
}
