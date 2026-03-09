"use client";

import { useQuery } from "@tanstack/react-query";
import type { TopHoldersResponse, ApiResponse } from "@/types/Analytics";
import type { ChainId } from "@/constants/chains";

const STALE_TIME = 30 * 1000;
const REFETCH_INTERVAL = 60 * 1000;

async function fetchTopHolders(chainId?: ChainId): Promise<TopHoldersResponse> {
  const params = new URLSearchParams({ limit: "5" });
  if (chainId) {
    params.set("chainId", String(chainId));
  }

  const response = await fetch(`/api/ausd/top-holders?${params.toString()}`);
  const result: ApiResponse<TopHoldersResponse> = await response.json();

  if (result.status === "error") {
    throw new Error(result.message ?? "Failed to fetch top holders");
  }

  if (!result.data) {
    throw new Error("No data received");
  }

  return result.data;
}

export function useTopHolders(chainId?: ChainId) {
  return useQuery({
    queryKey: ["ausd", "top-holders", chainId ?? "all"],
    queryFn: () => fetchTopHolders(chainId),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}
