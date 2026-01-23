import clickhouseClient from "@/lib/clients/clickhouse.client";
import { AUSD_ADDRESS_LOWER, SUPPORTED_CHAIN_IDS, type ChainId } from "@/constants/chains";
import type { ChainMetrics, AusdOverviewMetrics } from "@/types/Analytics";

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
