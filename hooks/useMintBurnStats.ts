"use client";

import { useQuery } from "@tanstack/react-query";
import type { MintBurnStatsResponse, ApiResponse } from "@/types/Analytics";
import type { ChainId } from "@/constants/chains";

const STALE_TIME = 30 * 1000;
const REFETCH_INTERVAL = 60 * 1000;

export interface MintBurnStatsFilter {
  months?: number;
  chainId?: ChainId;
}

async function fetchMintBurnStats(filter: MintBurnStatsFilter): Promise<MintBurnStatsResponse> {
  const params = new URLSearchParams();

  if (filter.months) {
    params.set("months", filter.months.toString());
  }
  if (filter.chainId) {
    params.set("chainId", filter.chainId.toString());
  }

  const response = await fetch(`/api/ausd/mint-burn-stats?${params.toString()}`);
  const result: ApiResponse<MintBurnStatsResponse> = await response.json();

  if (result.status === "error") {
    throw new Error(result.message ?? "Failed to fetch mint/burn stats");
  }

  if (!result.data) {
    throw new Error("No data received");
  }

  return result.data;
}

export function useMintBurnStats(filter: MintBurnStatsFilter = {}) {
  const { months = 1, chainId } = filter;

  return useQuery({
    queryKey: ["ausd", "mint-burn-stats", months, chainId],
    queryFn: () => fetchMintBurnStats({ months, chainId }),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}
