import clickhouseClient from "@/lib/clients/clickhouse.client";
import { AUSD_ADDRESS_LOWER, SUPPORTED_CHAIN_IDS, type ChainId } from "@/constants/chains";
import type {
  ChainMetrics,
  AusdOverviewMetrics,
  LastBlockByChain,
  DailyTransferStats,
  TransferStatsResponse,
  DailyMintBurnStats,
  MintBurnStatsResponse,
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
  const result = await clickhouseClient.query({
    query: `
      SELECT
        chain_id,
        toString(sum(amount)) as total_supply
      FROM total_supply FINAL
      WHERE token_address = {tokenAddress:FixedString(42)}
      GROUP BY chain_id
    `,
    query_params: {
      tokenAddress: AUSD_ADDRESS_LOWER,
    },
    format: "JSONEachRow",
  });

  return (await result.json()) as SupplyResult[];
}

async function getHoldersCountByChain(): Promise<HoldersResult[]> {
  const result = await clickhouseClient.query({
    query: `
      SELECT
        chain_id,
        toString(count(DISTINCT wallet_address)) as holders_count
      FROM balances FINAL
      WHERE token_address = {tokenAddress:FixedString(42)}
        AND amount > 0
      GROUP BY chain_id
    `,
    query_params: {
      tokenAddress: AUSD_ADDRESS_LOWER,
    },
    format: "JSONEachRow",
  });

  return (await result.json()) as HoldersResult[];
}

export async function getChainMetrics(chainId: ChainId): Promise<ChainMetrics> {
  const [supplyResult, holdersResult] = await Promise.all([
    clickhouseClient.query({
      query: `
        SELECT toString(sum(amount)) as total_supply
        FROM balances FINAL
        WHERE chain_id = {chainId:UInt16}
          AND token_address = {tokenAddress:FixedString(42)}
          AND amount > 0
      `,
      query_params: {
        chainId,
        tokenAddress: AUSD_ADDRESS_LOWER,
      },
      format: "JSONEachRow",
    }),
    clickhouseClient.query({
      query: `
        SELECT toString(count(DISTINCT wallet_address)) as holders_count
        FROM balances FINAL
        WHERE chain_id = {chainId:UInt16}
          AND token_address = {tokenAddress:FixedString(42)}
          AND amount > 0
      `,
      query_params: {
        chainId,
        tokenAddress: AUSD_ADDRESS_LOWER,
      },
      format: "JSONEachRow",
    }),
  ]);

  const supply = (await supplyResult.json()) as Array<{ total_supply: string }>;
  const holders = (await holdersResult.json()) as Array<{ holders_count: string }>;

  return {
    chainId,
    totalSupply: supply[0]?.total_supply ?? "0",
    holdersCount: parseInt(holders[0]?.holders_count ?? "0", 10),
  };
}

interface SyncResult {
  id: string;
  current_block: string;
}

export async function getLastBlockByChain(): Promise<LastBlockByChain[]> {
  const result = await clickhouseClient.query({
    query: `
      SELECT
        id,
        current as current_block
      FROM sync FINAL
    `,
    format: "JSONEachRow",
  });

  const data = (await result.json()) as SyncResult[];
  const blockMap = new Map(data.map((d) => [d.id, Number(d.current_block)]));

  return SUPPORTED_CHAIN_IDS.map((chainId) => ({
    chainId,
    blockNumber: blockMap.get(String(chainId)) ?? 0,
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

  const chainCondition = chainId ? "AND chain_id = {chainId:UInt16}" : "";

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

  const chainCondition = chainId ? "AND chain_id = {chainId:UInt16}" : "";

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
