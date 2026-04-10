import type { ChainId } from "@/constants/chains";

export interface ChainMetrics {
  chainId: ChainId;
  totalSupply: string;
  holdersCount: number;
}

export interface LastBlockByChain {
  chainId: ChainId;
  blockNumber: number;
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

export interface DailyTransferStats {
  date: string;
  transferCount: number;
  volume: string;
}

export interface TransferStatsResponse {
  stats: DailyTransferStats[];
  lastUpdated: string;
}

export interface DailyMintBurnStats {
  date: string;
  mintCount: number;
  mintVolume: string;
  burnCount: number;
  burnVolume: string;
}

export interface MintBurnStatsResponse {
  stats: DailyMintBurnStats[];
  lastUpdated: string;
}

export interface DailyTotalSupply {
  date: string;
  totalSupply: string;
}

export interface TotalSupplyDailyResponse {
  stats: DailyTotalSupply[];
  lastUpdated: string;
}

export interface TopHolder {
  walletAddress: string;
  totalBalance: string;
  chainBalances: { chainId: ChainId; balance: string }[];
}

export interface TopHoldersResponse {
  holders: TopHolder[];
  lastUpdated: string;
}
