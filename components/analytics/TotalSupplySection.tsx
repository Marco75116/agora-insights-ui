"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTotalSupplyDaily } from "@/hooks/useTotalSupplyDaily";
import { TotalSupplyChart } from "@/components/analytics/TotalSupplyChart";
import { ChartSkeleton } from "@/components/analytics/ChartSkeleton";
import type { ChainId } from "@/constants/chains";

export function TotalSupplySection() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const months = searchParams.get("supplyMonths")
    ? parseInt(searchParams.get("supplyMonths")!, 10)
    : 1;
  const chainId = searchParams.get("supplyChainId")
    ? (parseInt(searchParams.get("supplyChainId")!, 10) as ChainId)
    : (1 as ChainId);

  const {
    data: supplyData,
    isLoading: supplyLoading,
    error: supplyError,
  } = useTotalSupplyDaily({ months, chainId });

  const isLoading = supplyLoading;

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  if (isLoading) {
    return <ChartSkeleton height={300} />;
  }

  if (supplyError) {
    return <p className="text-destructive">Failed to load total supply: {supplyError.message}</p>;
  }

  if (!supplyData?.stats || supplyData.stats.length === 0) {
    return <p className="text-muted-foreground">No supply data available</p>;
  }

  return (
    <TotalSupplyChart
      supplyData={supplyData.stats}
      chainId={chainId}
      months={months}
      onMonthsChange={(value) => updateParams("supplyMonths", value)}
      onChainChange={(value) => updateParams("supplyChainId", value)}
    />
  );
}
