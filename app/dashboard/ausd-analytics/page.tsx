import { Suspense } from "react";
import { ChainBreakdownSection } from "@/components/analytics/ChainBreakdownSection";
import { TotalSupplySection } from "@/components/analytics/TotalSupplySection";
import { TopHoldersSection } from "@/components/analytics/TopHoldersSection";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CHAIN_IDS, SUPPORTED_CHAIN_IDS, type ChainId } from "@/constants/chains";

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

function ChainBreakdownFallback() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  );
}

function TotalSupplyFallback() {
  return <ChartSkeleton />;
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AusdAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const holdersChainIdRaw =
    typeof params.holdersChainId === "string" ? parseInt(params.holdersChainId, 10) : NaN;
  const holdersChainId: ChainId = SUPPORTED_CHAIN_IDS.includes(holdersChainIdRaw as ChainId)
    ? (holdersChainIdRaw as ChainId)
    : CHAIN_IDS.ETHEREUM;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">AUSD Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Overview of AUSD token metrics across supported chains
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[4fr_1fr]">
        <Suspense fallback={<ChainBreakdownFallback />}>
          <ChainBreakdownSection />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <TopHoldersSection chainId={holdersChainId} />
        </Suspense>
      </div>

      <Suspense fallback={<TotalSupplyFallback />}>
        <TotalSupplySection />
      </Suspense>
    </div>
  );
}
