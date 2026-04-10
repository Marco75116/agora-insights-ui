import clickhouseClient from "@/lib/clients/clickhouse.client";
import {
  AUSD_ADDRESS,
  AUSD_ADDRESS_LOWER,
  CHAINS,
  SUPPORTED_CHAIN_IDS,
  type ChainId,
} from "@/constants/chains";
import { env } from "@/lib/env";
import { MISTI_BASE_URL } from "@/constants/global";
import type {
  ChainMetrics,
  AusdOverviewMetrics,
  LastBlockByChain,
  DailyTransferStats,
  TransferStatsResponse,
  DailyMintBurnStats,
  MintBurnStatsResponse,
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
  const [supplyData, holdersData, lastBlockData] = await Promise.all([
    getTotalSupplyByChain(),
    getHoldersCountByChain(),
    getLastBlockByChain(),
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
    lastBlockByChain: lastBlockData,
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

export async function getChainMetrics(chainId: ChainId): Promise<ChainMetrics> {
  const apiKey = env.MISTI_API_KEY;

  const supplyUrl = new URL(`${MISTI_BASE_URL}/erc20/supply`);
  supplyUrl.searchParams.set("chain_id", chainId.toString());
  supplyUrl.searchParams.set("token", AUSD_ADDRESS);

  const holderCountUrl = new URL(`${MISTI_BASE_URL}/erc20/holder-count`);
  holderCountUrl.searchParams.set("chain_id", chainId.toString());
  holderCountUrl.searchParams.set("token", AUSD_ADDRESS);

  const headers = { "x-api-key": apiKey };

  const [supplyRes, holderCountRes] = await Promise.all([
    fetch(supplyUrl, { headers }),
    fetch(holderCountUrl, { headers }),
  ]);

  if (!supplyRes.ok) {
    throw new Error(
      `Misti API error for supply on chain ${chainId}: ${supplyRes.status} ${supplyRes.statusText}`
    );
  }
  if (!holderCountRes.ok) {
    throw new Error(
      `Misti API error for holder count on chain ${chainId}: ${holderCountRes.status} ${holderCountRes.statusText}`
    );
  }

  const supplyData = (await supplyRes.json()) as {
    token_address: string;
    chain_id: number;
    total_supply: string;
  }[];
  const holderCountData = (await holderCountRes.json()) as {
    token_address: string;
    chain_id: number;
    holder_count: number;
  }[];

  return {
    chainId,
    totalSupply: supplyData[0]?.total_supply ?? "0",
    holdersCount: holderCountData[0]?.holder_count ?? 0,
  };
}

interface SyncResult {
  id: string;
  current: string;
}

interface SyncCursor {
  number: number;
}

export async function getLastBlockByChain(): Promise<LastBlockByChain[]> {
  const result = await clickhouseClient.query({
    query: `
      SELECT id, current
      FROM sync FINAL
    `,
    format: "JSONEachRow",
  });

  const data = (await result.json()) as SyncResult[];
  const blockMap = new Map<string, number>();

  for (const row of data) {
    const cursor = JSON.parse(row.current) as SyncCursor;
    const existing = blockMap.get(row.id);
    if (!existing || cursor.number > existing) {
      blockMap.set(row.id, cursor.number);
    }
  }

  return SUPPORTED_CHAIN_IDS.map((chainId) => ({
    chainId,
    blockNumber: blockMap.get(CHAINS[chainId].tag) ?? 0,
  }));
}

interface TransferStatsResult {
  date: string;
  transfer_count: string;
  volume: string;
}

export interface TransferStatsFilter {
  months?: number;
  chainId?: ChainId;
}

export async function getTransferStatsDaily(
  filter: TransferStatsFilter = {}
): Promise<TransferStatsResponse> {
  const { months = 1, chainId } = filter;
  const days = months * 30;

  const chainCondition = chainId ? "AND chain_id = {chainId:UInt32}" : "";

  const result = await clickhouseClient.query({
    query: `
      SELECT
        toString(day) as date,
        toString(sum(transfer_count)) as transfer_count,
        toString(sum(volume)) as volume
      FROM (
        SELECT date as day, transfer_count, volume
        FROM transfer_stats_daily FINAL
        WHERE token_address = {tokenAddress:FixedString(42)}
          AND date >= today() - {days:UInt32}
          ${chainCondition}
      )
      GROUP BY day
      ORDER BY day ASC
    `,
    query_params: {
      tokenAddress: AUSD_ADDRESS_LOWER,
      days,
      ...(chainId && { chainId }),
    },
    format: "JSONEachRow",
  });

  const data = (await result.json()) as TransferStatsResult[];

  const stats: DailyTransferStats[] = data.map((row) => ({
    date: row.date,
    transferCount: parseInt(row.transfer_count, 10),
    volume: row.volume,
  }));

  return {
    stats,
    lastUpdated: new Date().toISOString(),
  };
}

interface TotalSupplyDailyResult {
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
  const days = months * 30;

  const result = await clickhouseClient.query({
    query: `
      SELECT
        toString(date) as date,
        toString(sum(amount) OVER (PARTITION BY chain_id, token_address ORDER BY date)) as total_supply
      FROM total_supply_daily FINAL
      WHERE token_address = {tokenAddress:FixedString(42)}
        AND chain_id = {chainId:UInt32}
      ORDER BY date ASC
    `,
    query_params: {
      tokenAddress: AUSD_ADDRESS_LOWER,
      chainId,
    },
    format: "JSONEachRow",
  });

  const allData = (await result.json()) as TotalSupplyDailyResult[];

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - days);

  const supplyByDate = new Map(allData.map((row) => [row.date, row.total_supply]));

  let lastKnownSupply = "0";
  for (const row of allData) {
    if (row.date < startDate.toISOString().slice(0, 10)) {
      lastKnownSupply = row.total_supply;
    }
  }

  const stats: DailyTotalSupply[] = [];
  const current = new Date(startDate);
  while (current <= today) {
    const dateStr = current.toISOString().slice(0, 10);
    const supply = supplyByDate.get(dateStr);
    if (supply !== undefined) {
      lastKnownSupply = supply;
    }
    stats.push({ date: dateStr, totalSupply: lastKnownSupply });
    current.setDate(current.getDate() + 1);
  }

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

interface MintBurnStatsResult {
  date: string;
  mint_count: string;
  mint_volume: string;
  burn_count: string;
  burn_volume: string;
}

export interface MintBurnStatsFilter {
  months?: number;
  chainId?: ChainId;
}

export async function getMintBurnStatsDaily(
  filter: MintBurnStatsFilter = {}
): Promise<MintBurnStatsResponse> {
  const { months = 1, chainId } = filter;
  const days = months * 30;

  const chainCondition = chainId ? "AND chain_id = {chainId:UInt32}" : "";

  const result = await clickhouseClient.query({
    query: `
      SELECT
        toString(day) as date,
        toString(sum(mint_count)) as mint_count,
        toString(sum(mint_volume)) as mint_volume,
        toString(sum(burn_count)) as burn_count,
        toString(sum(burn_volume)) as burn_volume
      FROM (
        SELECT date as day, mint_count, mint_volume, burn_count, burn_volume
        FROM mint_burn_daily FINAL
        WHERE token_address = {tokenAddress:FixedString(42)}
          AND date >= today() - {days:UInt32}
          ${chainCondition}
      )
      GROUP BY day
      ORDER BY day ASC
    `,
    query_params: {
      tokenAddress: AUSD_ADDRESS_LOWER,
      days,
      ...(chainId && { chainId }),
    },
    format: "JSONEachRow",
  });

  const data = (await result.json()) as MintBurnStatsResult[];

  const stats: DailyMintBurnStats[] = data.map((row) => ({
    date: row.date,
    mintCount: parseInt(row.mint_count, 10),
    mintVolume: row.mint_volume,
    burnCount: parseInt(row.burn_count, 10),
    burnVolume: row.burn_volume,
  }));

  return {
    stats,
    lastUpdated: new Date().toISOString(),
  };
}
