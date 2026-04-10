import { AUSD_ADDRESS, SUPPORTED_CHAIN_IDS } from "@/constants/chains";
import { env } from "@/lib/env";
import { MISTI_BASE_URL } from "@/constants/global";
import type {
  ChainBalance,
  ChainBalanceHistory,
  BalanceSnapshot,
  WalletBalanceData,
} from "@/types/WalletBalance";

interface MistiBalanceEntry {
  token_address: string;
  chain_id: number;
  wallet_address: string;
  balance: string;
}

interface MistiBalanceHistoryEntry {
  date: string;
  balance: string;
}

export async function getWalletBalanceData(walletAddress: string): Promise<WalletBalanceData> {
  const normalizedAddress = walletAddress.toLowerCase();

  const [balancesData, historyByChain] = await Promise.all([
    getWalletBalances(normalizedAddress),
    getBalanceHistoryAllChains(normalizedAddress),
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
    lastUpdated: new Date().toISOString(),
  };
}

async function getWalletBalances(walletAddress: string): Promise<MistiBalanceEntry[]> {
  const apiKey = env.MISTI_API_KEY;

  const results = await Promise.allSettled(
    SUPPORTED_CHAIN_IDS.map(async (chainId) => {
      const url = new URL(`${MISTI_BASE_URL}/erc20/balance`);
      url.searchParams.set("chain_id", chainId.toString());
      url.searchParams.set("token", AUSD_ADDRESS);
      url.searchParams.set("wallet", walletAddress);

      const res = await fetch(url, {
        headers: { "x-api-key": apiKey },
      });

      if (!res.ok) {
        throw new Error(`Misti API error for chain ${chainId}: ${res.status} ${res.statusText}`);
      }

      return (await res.json()) as MistiBalanceEntry[];
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<MistiBalanceEntry[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);
}

async function getBalanceHistoryAllChains(
  walletAddress: string
): Promise<Map<number, MistiBalanceHistoryEntry[]>> {
  const apiKey = env.MISTI_API_KEY;

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 365);

  const results = await Promise.allSettled(
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
  for (const result of results) {
    if (result.status === "fulfilled") {
      map.set(result.value.chainId, result.value.data);
    }
  }
  return map;
}
