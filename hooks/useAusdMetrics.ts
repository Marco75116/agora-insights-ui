"use client";

import { useQuery } from "@tanstack/react-query";
import type { AusdOverviewMetrics, ApiResponse } from "@/types/Analytics";
import { env } from "@/lib/env";

const STALE_TIME = 30 * 1000;
const REFETCH_INTERVAL = 60 * 1000;

async function fetchAusdMetrics(): Promise<AusdOverviewMetrics> {
  const response = await fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/ausd/overview`);
  const result: ApiResponse<AusdOverviewMetrics> = await response.json();

  if (result.status === "error") {
    throw new Error(result.message ?? "Failed to fetch AUSD metrics");
  }

  if (!result.data) {
    throw new Error("No data received");
  }

  return result.data;
}

export function useAusdMetrics() {
  return useQuery({
    queryKey: ["ausd", "overview"],
    queryFn: fetchAusdMetrics,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
  });
}
