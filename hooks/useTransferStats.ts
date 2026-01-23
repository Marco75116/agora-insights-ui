"use client";

import { useQuery } from "@tanstack/react-query";
import type { TransferStatsResponse, ApiResponse } from "@/types/Analytics";
import type { ChainId } from "@/constants/chains";

const STALE_TIME = 30 * 1000;
const REFETCH_INTERVAL = 60 * 1000;

export interface TransferStatsFilter {
  months?: number;
  chainId?: ChainId;
}

async function fetchTransferStats(filter: TransferStatsFilter): Promise<TransferStatsResponse> {
  const params = new URLSearchParams();

  if (filter.months) {
    params.set("months", filter.months.toString());
  }
  if (filter.chainId) {
    params.set("chainId", filter.chainId.toString());
  }

  const response = await fetch(`/api/ausd/transfer-stats?${params.toString()}`);
  const result: ApiResponse<TransferStatsResponse> = await response.json();

  if (result.status === "error") {
    throw new Error(result.message ?? "Failed to fetch transfer stats");
  }

  if (!result.data) {
    throw new Error("No data received");
  }

  return result.data;
}

export function useTransferStats(filter: TransferStatsFilter = {}) {
  const { months = 1, chainId } = filter;

  return useQuery({
    queryKey: ["ausd", "transfer-stats", months, chainId],
    queryFn: () => fetchTransferStats({ months, chainId }),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}
