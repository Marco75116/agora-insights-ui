import { Suspense } from "react";
import { ChainBreakdownSection } from "@/components/analytics/ChainBreakdownSection";
import { TotalSupplySection } from "@/components/analytics/TotalSupplySection";
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

function ChainBreakdownFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  );
}

function TotalSupplyFallback() {
  return <ChartSkeleton />;
}

export default function AusdAnalyticsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">AUSD Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Overview of AUSD token metrics across supported chains
        </p>
      </div>

      <Suspense fallback={<ChainBreakdownFallback />}>
        <ChainBreakdownSection />
      </Suspense>

      <Suspense fallback={<TotalSupplyFallback />}>
        <TotalSupplySection />
      </Suspense>
    </div>
  );
}
