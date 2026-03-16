import clickhouseClient from "@/lib/clients/clickhouse.client";
import { AUSD_ADDRESS_LOWER, SUPPORTED_CHAIN_IDS } from "@/constants/chains";
import { getLastBlockByChain } from "@/lib/services/ausd.service";
import type {
  ChainBalance,
  ChainBalanceHistory,
  BalanceSnapshot,
  WalletBalanceData,
} from "@/types/WalletBalance";

interface BalanceResult {
  chain_id: number;
  balance: string;
}

interface SnapshotResult {
  chain_id: number;
  block_number: string;
  delta: string;
}

export async function getWalletBalanceData(walletAddress: string): Promise<WalletBalanceData> {
  const normalizedAddress = walletAddress.toLowerCase();

  const [balancesData, historyData, lastBlockData] = await Promise.all([
    getWalletBalances(normalizedAddress),
    getWalletBalanceHistory(normalizedAddress),
    getLastBlockByChain(),
  ]);

  const balances: ChainBalance[] = SUPPORTED_CHAIN_IDS.map((chainId) => {
    const chainBalance = balancesData.find((b) => b.chain_id === chainId);
    return {
      chainId,
      balance: chainBalance?.balance ?? "0",
    };
  });

  const history: ChainBalanceHistory[] = SUPPORTED_CHAIN_IDS.map((chainId) => {
    const chainSnapshots = historyData
      .filter((s) => s.chain_id === chainId)
      .sort((a, b) => Number(a.block_number) - Number(b.block_number));

    let runningTotal = BigInt(0);
    const snapshots: BalanceSnapshot[] = chainSnapshots.map((s) => {
      runningTotal += BigInt(s.delta);
      return {
        blockNumber: Number(s.block_number),
        delta: s.delta,
        totalBalance: runningTotal.toString(),
      };
    });

    return {
      chainId,
      snapshots,
    };
  });

  return {
    walletAddress: normalizedAddress,
    balances,
    history,
    lastBlockByChain: lastBlockData,
    lastUpdated: new Date().toISOString(),
  };
}

async function getWalletBalances(walletAddress: string): Promise<BalanceResult[]> {
  const result = await clickhouseClient.query({
    query: `
      SELECT
        chain_id,
        toString(sum(amount)) as balance
      FROM balances FINAL
      WHERE wallet_address = {walletAddress:FixedString(42)}
        AND token_address = {tokenAddress:FixedString(42)}
      GROUP BY chain_id
    `,
    query_params: {
      walletAddress,
      tokenAddress: AUSD_ADDRESS_LOWER,
    },
    format: "JSONEachRow",
  });

  return (await result.json()) as BalanceResult[];
}

async function getWalletBalanceHistory(walletAddress: string): Promise<SnapshotResult[]> {
  const result = await clickhouseClient.query({
    query: `
      SELECT
        chain_id,
        toString(block_number) as block_number,
        toString(sum(delta)) as delta
      FROM balance_snapshots FINAL
      WHERE wallet_address = {walletAddress:FixedString(42)}
        AND token_address = {tokenAddress:FixedString(42)}
      GROUP BY chain_id, block_number
      ORDER BY chain_id, block_number
    `,
    query_params: {
      walletAddress,
      tokenAddress: AUSD_ADDRESS_LOWER,
    },
    format: "JSONEachRow",
  });

  return (await result.json()) as SnapshotResult[];
}
