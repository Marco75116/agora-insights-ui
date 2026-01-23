import type { ChainId } from "@/constants/chains";

export interface ChainMetrics {
  chainId: ChainId;
  totalSupply: string;
  holdersCount: number;
}

export interface AusdOverviewMetrics {
  totalSupplyAcrossChains: string;
  totalHoldersAcrossChains: number;
  chainBreakdown: ChainMetrics[];
  lastUpdated: string;
}

export interface ApiResponse<T> {
  status: "ok" | "error";
  data?: T;
  message?: string;
}
