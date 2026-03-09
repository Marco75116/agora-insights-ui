"use client";

import { useAusdMetrics } from "@/hooks/useAusdMetrics";
import { ChainBreakdownChart } from "@/components/analytics/ChainBreakdownChart";

export function ChainBreakdownSection() {
  const { data, isLoading, error } = useAusdMetrics();

  if (error) {
    return <p className="text-destructive col-span-2">Failed to load metrics: {error.message}</p>;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <ChainBreakdownChart
          data={data?.chainBreakdown ?? []}
          metric="supply"
          isLoading={isLoading}
        />
        <ChainBreakdownChart
          data={data?.chainBreakdown ?? []}
          metric="holders"
          isLoading={isLoading}
        />
      </div>

      {data?.lastUpdated && (
        <p className="text-muted-foreground text-xs">
          Last updated:{" "}
          {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
            new Date(data.lastUpdated)
          )}
        </p>
      )}
    </>
  );
}
