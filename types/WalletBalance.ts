import type { ChainId } from "@/constants/chains";
import type { LastBlockByChain } from "@/types/Analytics";

export interface ChainBalance {
  chainId: ChainId;
  balance: string;
}

export interface BalanceSnapshot {
  blockNumber: number;
  date: string;
  delta: string;
  totalBalance: string;
}

export interface ChainBalanceHistory {
  chainId: ChainId;
  snapshots: BalanceSnapshot[];
}

export interface WalletBalanceData {
  walletAddress: string;
  balances: ChainBalance[];
  history: ChainBalanceHistory[];
  lastBlockByChain: LastBlockByChain[];
  lastUpdated: string;
}
