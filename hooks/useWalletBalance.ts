"use client";

import { useQuery } from "@tanstack/react-query";
import type { WalletBalanceData } from "@/types/WalletBalance";
import type { ApiResponse } from "@/types/Analytics";

const STALE_TIME = 30 * 1000;
const REFETCH_INTERVAL = 60 * 1000;

async function fetchWalletBalance(walletAddress: string): Promise<WalletBalanceData> {
  const response = await fetch(`/api/wallet/${walletAddress.toLowerCase()}`);
  const result: ApiResponse<WalletBalanceData> = await response.json();

  if (result.status === "error") {
    throw new Error(result.message ?? "Failed to fetch wallet balance");
  }

  if (!result.data) {
    throw new Error("No data received");
  }

  return result.data;
}

export function useWalletBalance(walletAddress: string) {
  return useQuery({
    queryKey: ["wallet", "balance", walletAddress.toLowerCase()],
    queryFn: () => fetchWalletBalance(walletAddress),
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
    enabled: Boolean(walletAddress),
  });
}
