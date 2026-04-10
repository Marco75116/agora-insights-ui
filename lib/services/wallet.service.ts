import clickhouseClient from "@/lib/clients/clickhouse.client";
import { AUSD_ADDRESS, AUSD_ADDRESS_LOWER, SUPPORTED_CHAIN_IDS } from "@/constants/chains";
import { getLastBlockByChain } from "@/lib/services/ausd.service";
import { env } from "@/lib/env";
import { MISTI_BASE_URL } from "@/constants/global";
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

interface MistiBalanceHistoryEntry {
  date: string;
  balance: string;
}

export async function getWalletBalanceData(walletAddress: string): Promise<WalletBalanceData> {
  const normalizedAddress = walletAddress.toLowerCase();

  const [balancesData, historyByChain, lastBlockData] = await Promise.all([
    getWalletBalances(normalizedAddress),
    getBalanceHistoryAllChains(normalizedAddress),
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
    const chainHistory = historyByChain.get(chainId) ?? [];
    const snapshots: BalanceSnapshot[] = chainHistory.map((entry) => ({
      date: entry.date,
      balance: entry.balance,
    }));
    return { chainId, snapshots };
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

async function getBalanceHistoryAllChains(
  walletAddress: string
): Promise<Map<number, MistiBalanceHistoryEntry[]>> {
  const apiKey = env.MISTI_API_KEY;

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 365);

  const results = await Promise.all(
    SUPPORTED_CHAIN_IDS.map(async (chainId) => {
      const url = new URL(`${MISTI_BASE_URL}/erc20/balance-history`);
      url.searchParams.set("chain_id", chainId.toString());
      url.searchParams.set("token", AUSD_ADDRESS);
      url.searchParams.set("wallet", walletAddress);
      url.searchParams.set("from", startDate.toISOString().slice(0, 10));
      url.searchParams.set("to", today.toISOString().slice(0, 10));

      const res = await fetch(url, {
        headers: { "x-api-key": apiKey },
      });

      if (!res.ok) {
        throw new Error(`Misti API error for chain ${chainId}: ${res.status} ${res.statusText}`);
      }

      const data = (await res.json()) as MistiBalanceHistoryEntry[];
      return { chainId, data };
    })
  );

  const map = new Map<number, MistiBalanceHistoryEntry[]>();
  for (const { chainId, data } of results) {
    map.set(chainId, data);
  }
  return map;
}
