"use client";

import { Suspense } from "react";
import { useAusdMetrics } from "@/hooks/useAusdMetrics";
import { ChainStatsTable } from "@/components/analytics/ChainStatsTable";
import { ChainBreakdownChart } from "@/components/analytics/ChainBreakdownChart";
import { TransferStatsSection } from "@/components/analytics/TransferStatsSection";
import { MintBurnStatsSection } from "@/components/analytics/MintBurnStatsSection";
import { AUSD_DECIMALS } from "@/constants/chains";
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
        <h1 className="text-2xl font-semibold text-balance">AUSD Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Overview of AUSD token metrics across supported chains
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-24" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                    Total Supply
                  </div>
                  <div className="text-2xl font-bold tracking-tight tabular-nums">
                    {formatTokenAmount(data?.totalSupplyAcrossChains ?? "0", AUSD_DECIMALS)}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                    <Users className="h-3.5 w-3.5" aria-hidden="true" />
                    Total Holders
                  </div>
                  <div className="text-2xl font-bold tracking-tight tabular-nums">
                    {formatNumber(data?.totalHoldersAcrossChains ?? 0)}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <ChainStatsTable data={data?.chainBreakdown ?? []} isLoading={isLoading} />
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

      <Suspense fallback={<TransferStatsFallback />}>
        <MintBurnStatsSection />
      </Suspense>

      {data?.lastUpdated && (
        <p className="text-muted-foreground text-xs">
          Last updated:{" "}
          {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
            new Date(data.lastUpdated)
          )}
        </p>
      )}
    </div>
  );
}
