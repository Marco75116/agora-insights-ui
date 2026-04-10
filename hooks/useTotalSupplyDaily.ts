"use client";

import { useQuery } from "@tanstack/react-query";
import type { TotalSupplyDailyResponse, ApiResponse } from "@/types/Analytics";
import type { ChainId } from "@/constants/chains";
import { env } from "@/lib/env";

const STALE_TIME = 30 * 1000;
const REFETCH_INTERVAL = 60 * 1000;

export interface TotalSupplyDailyFilter {
  months?: number;
  chainId: ChainId;
}

async function fetchTotalSupplyDaily(
  filter: TotalSupplyDailyFilter
): Promise<TotalSupplyDailyResponse> {
  const params = new URLSearchParams();
  params.set("chainId", filter.chainId.toString());

  if (filter.months) {
    params.set("months", filter.months.toString());
  }

  const response = await fetch(
    `${env.NEXT_PUBLIC_BASE_URL}/api/ausd/total-supply-daily?${params.toString()}`
  );
  const result: ApiResponse<TotalSupplyDailyResponse> = await response.json();

  if (result.status === "error") {
    throw new Error(result.message ?? "Failed to fetch total supply daily");
  }

  if (!result.data) {
    throw new Error("No data received");
  }

  return result.data;
}

export function useTotalSupplyDaily(filter: TotalSupplyDailyFilter) {
  const { months = 1, chainId } = filter;

  return useQuery({
    queryKey: ["ausd", "total-supply-daily", months, chainId],
    queryFn: () => fetchTotalSupplyDaily({ months, chainId }),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}
