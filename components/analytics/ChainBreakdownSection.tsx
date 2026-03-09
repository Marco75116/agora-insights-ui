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
    </>
  );
}
