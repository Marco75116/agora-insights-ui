import { MetricCardSkeleton } from "@/components/analytics/MetricCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { SUPPORTED_CHAIN_IDS } from "@/constants/chains";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {SUPPORTED_CHAIN_IDS.map((chainId) => (
          <MetricCardSkeleton key={chainId} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SUPPORTED_CHAIN_IDS.map((chainId) => (
          <div key={chainId} className="rounded-lg border p-6">
            <Skeleton className="mb-4 h-6 w-48" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
