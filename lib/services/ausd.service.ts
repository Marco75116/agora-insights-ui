import { AUSD_ADDRESS, SUPPORTED_CHAIN_IDS, type ChainId } from "@/constants/chains";
import { env } from "@/lib/env";
import { MISTI_BASE_URL } from "@/constants/global";
import type {
  ChainMetrics,
  AusdOverviewMetrics,
  DailyTotalSupply,
  TotalSupplyDailyResponse,
  TopHolder,
  TopHoldersResponse,
} from "@/types/Analytics";

interface SupplyResult {
  chain_id: number;
  total_supply: string;
}

interface HoldersResult {
  chain_id: number;
  holders_count: string;
}

export async function getAusdMetrics(): Promise<AusdOverviewMetrics> {
  const [supplyData, holdersData] = await Promise.all([
    getTotalSupplyByChain(),
    getHoldersCountByChain(),
  ]);

  const supplyMap = new Map(supplyData.map((s) => [s.chain_id, s.total_supply]));
  const holdersMap = new Map(holdersData.map((h) => [h.chain_id, parseInt(h.holders_count, 10)]));

  const chainBreakdown: ChainMetrics[] = SUPPORTED_CHAIN_IDS.map((chainId) => ({
    chainId,
    totalSupply: supplyMap.get(chainId) ?? "0",
    holdersCount: holdersMap.get(chainId) ?? 0,
  }));

  const totalSupplyAcrossChains = chainBreakdown
    .reduce((sum, chain) => sum + BigInt(chain.totalSupply), BigInt(0))
    .toString();

  const totalHoldersAcrossChains = chainBreakdown.reduce(
    (sum, chain) => sum + chain.holdersCount,
    0
  );

  return {
    totalSupplyAcrossChains,
    totalHoldersAcrossChains,
    chainBreakdown,
    lastUpdated: new Date().toISOString(),
  };
}

async function getTotalSupplyByChain(): Promise<SupplyResult[]> {
  const apiKey = env.MISTI_API_KEY;

  const responses = await Promise.all(
    SUPPORTED_CHAIN_IDS.map(async (chainId) => {
      const url = new URL(`${MISTI_BASE_URL}/erc20/supply`);
      url.searchParams.set("chain_id", chainId.toString());
      url.searchParams.set("token", AUSD_ADDRESS);

      const res = await fetch(url, {
        headers: { "x-api-key": apiKey },
      });

      if (!res.ok) {
        throw new Error(`Misti API error for chain ${chainId}: ${res.status} ${res.statusText}`);
      }

      const data = (await res.json()) as {
        token_address: string;
        chain_id: number;
        total_supply: string;
      }[];

      return data.map((item) => ({
        chain_id: item.chain_id,
        total_supply: item.total_supply,
      }));
    })
  );

  return responses.flat();
}

async function getHoldersCountByChain(): Promise<HoldersResult[]> {
  const apiKey = env.MISTI_API_KEY;

  const responses = await Promise.all(
    SUPPORTED_CHAIN_IDS.map(async (chainId) => {
      const url = new URL(`${MISTI_BASE_URL}/erc20/holder-count`);
      url.searchParams.set("chain_id", chainId.toString());
      url.searchParams.set("token", AUSD_ADDRESS);

      const res = await fetch(url, {
        headers: { "x-api-key": apiKey },
      });

      if (!res.ok) {
        throw new Error(`Misti API error for chain ${chainId}: ${res.status} ${res.statusText}`);
      }

      const data = (await res.json()) as {
        token_address: string;
        chain_id: number;
        holder_count: number;
      }[];

      return data.map((item) => ({
        chain_id: item.chain_id,
        holders_count: item.holder_count.toString(),
      }));
    })
  );

  return responses.flat();
}

interface MistiSupplyHistoryResult {
  date: string;
  total_supply: string;
}

export interface TotalSupplyDailyFilter {
  months?: number;
  chainId: ChainId;
}

export async function getTotalSupplyDaily(
  filter: TotalSupplyDailyFilter
): Promise<TotalSupplyDailyResponse> {
  const { months = 1, chainId } = filter;
  const apiKey = env.MISTI_API_KEY;

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - months * 30);

  const url = new URL(`${MISTI_BASE_URL}/erc20/supply-history`);
  url.searchParams.set("chain_id", chainId.toString());
  url.searchParams.set("token", AUSD_ADDRESS);
  url.searchParams.set("from", startDate.toISOString().slice(0, 10));
  url.searchParams.set("to", today.toISOString().slice(0, 10));

  const res = await fetch(url, {
    headers: { "x-api-key": apiKey },
  });

  if (!res.ok) {
    throw new Error(`Misti API error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as MistiSupplyHistoryResult[];

  const stats: DailyTotalSupply[] = data.map((row) => ({
    date: row.date,
    totalSupply: row.total_supply,
  }));

  return {
    stats,
    lastUpdated: new Date().toISOString(),
  };
}

interface MistiHolder {
  wallet_address: string;
  token_address: string;
  chain_id: number;
  balance: string;
}

export interface TopHoldersFilter {
  limit?: number;
  chainId?: ChainId;
}

export async function getTopHolders(filter: TopHoldersFilter = {}): Promise<TopHoldersResponse> {
  const apiKey = env.MISTI_API_KEY;

  const { limit = 10, chainId } = filter;
  const headers = { "x-api-key": apiKey };
  const chainIds = chainId ? [chainId] : SUPPORTED_CHAIN_IDS;

  const responses = await Promise.all(
    chainIds.map(async (cId) => {
      const url = new URL(`${MISTI_BASE_URL}/erc20/holders`);
      url.searchParams.set("chain_id", cId.toString());
      url.searchParams.set("token", AUSD_ADDRESS);
      url.searchParams.set("first", limit.toString());
      url.searchParams.set("sort", "desc");

      const res = await fetch(url, { headers });

      if (!res.ok) {
        throw new Error(
          `Misti API error for holders on chain ${cId}: ${res.status} ${res.statusText}`
        );
      }

      return (await res.json()) as MistiHolder[];
    })
  );

  const holdersMap = new Map<string, TopHolder>();
  for (const chainHolders of responses) {
    for (const row of chainHolders) {
      const existing = holdersMap.get(row.wallet_address);
      const chainBalance = { chainId: row.chain_id as ChainId, balance: row.balance };
      if (existing) {
        existing.chainBalances.push(chainBalance);
        existing.totalBalance = (BigInt(existing.totalBalance) + BigInt(row.balance)).toString();
      } else {
        holdersMap.set(row.wallet_address, {
          walletAddress: row.wallet_address,
          totalBalance: row.balance,
          chainBalances: [chainBalance],
        });
      }
    }
  }

  const holders = Array.from(holdersMap.values())
    .sort((a, b) => (BigInt(b.totalBalance) > BigInt(a.totalBalance) ? 1 : -1))
    .slice(0, limit);

  return {
    holders,
    lastUpdated: new Date().toISOString(),
  };
}
