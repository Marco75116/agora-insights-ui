import { Elysia, t } from "elysia";
import {
  getAusdMetrics,
  getTransferStatsDaily,
  getMintBurnStatsDaily,
  getTotalSupplyDaily,
  getTopHolders,
} from "@/lib/services/ausd.service";
import { getWalletBalanceData } from "@/lib/services/wallet.service";
import { isValidEthereumAddress } from "@/lib/helpers/address";
import { SUPPORTED_CHAIN_IDS, type ChainId } from "@/constants/chains";

const VALID_MONTHS = [1, 3, 6, 12];

function parseMonths(value: string | undefined): number | null {
  if (!value) return 1;
  const months = parseInt(value, 10);
  if (Number.isNaN(months) || !VALID_MONTHS.includes(months)) return null;
  return months;
}

function parseChainId(value: string | undefined): ChainId | null {
  if (!value) return null;
  const id = parseInt(value, 10);
  if (Number.isNaN(id) || !SUPPORTED_CHAIN_IDS.includes(id as ChainId)) return null;
  return id as ChainId;
}

const app = new Elysia({ prefix: "/api" })
  .get("/ausd/overview", async () => {
    try {
      const metrics = await getAusdMetrics();
      return { status: "ok", data: metrics };
    } catch (error) {
      console.error("AUSD metrics error:", error);
      return { status: "error", message: String(error) };
    }
  })
  .get(
    "/ausd/transfer-stats",
    async ({ query }) => {
      try {
        const months = parseMonths(query.months);
        if (months === null) {
          return {
            status: "error",
            message: `Invalid months. Allowed: ${VALID_MONTHS.join(", ")}`,
          };
        }

        const chainId = query.chainId ? parseChainId(query.chainId) : undefined;
        if (query.chainId && chainId === null) {
          return {
            status: "error",
            message: `Invalid chainId. Allowed: ${SUPPORTED_CHAIN_IDS.join(", ")}`,
          };
        }

        const stats = await getTransferStatsDaily({ months, chainId: chainId ?? undefined });
        return { status: "ok", data: stats };
      } catch (error) {
        console.error("Transfer stats error:", error);
        return { status: "error", message: String(error) };
      }
    },
    {
      query: t.Object({
        months: t.Optional(t.String()),
        chainId: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/ausd/mint-burn-stats",
    async ({ query }) => {
      try {
        const months = parseMonths(query.months);
        if (months === null) {
          return {
            status: "error",
            message: `Invalid months. Allowed: ${VALID_MONTHS.join(", ")}`,
          };
        }

        const chainId = query.chainId ? parseChainId(query.chainId) : undefined;
        if (query.chainId && chainId === null) {
          return {
            status: "error",
            message: `Invalid chainId. Allowed: ${SUPPORTED_CHAIN_IDS.join(", ")}`,
          };
        }

        const stats = await getMintBurnStatsDaily({ months, chainId: chainId ?? undefined });
        return { status: "ok", data: stats };
      } catch (error) {
        console.error("Mint/burn stats error:", error);
        return { status: "error", message: String(error) };
      }
    },
    {
      query: t.Object({
        months: t.Optional(t.String()),
        chainId: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/ausd/total-supply-daily",
    async ({ query }) => {
      try {
        const months = parseMonths(query.months);
        if (months === null) {
          return {
            status: "error",
            message: `Invalid months. Allowed: ${VALID_MONTHS.join(", ")}`,
          };
        }

        const chainId = parseChainId(query.chainId);
        if (chainId === null) {
          return {
            status: "error",
            message: `Invalid or missing chainId. Allowed: ${SUPPORTED_CHAIN_IDS.join(", ")}`,
          };
        }

        const stats = await getTotalSupplyDaily({ months, chainId });
        return { status: "ok", data: stats };
      } catch (error) {
        console.error("Total supply daily error:", error);
        return { status: "error", message: String(error) };
      }
    },
    {
      query: t.Object({
        months: t.Optional(t.String()),
        chainId: t.String(),
      }),
    }
  )
  .get(
    "/ausd/top-holders",
    async ({ query }) => {
      try {
        const limit = query.limit ? parseInt(query.limit, 10) : 10;
        if (Number.isNaN(limit) || limit < 1 || limit > 100) {
          return { status: "error", message: "Invalid limit. Must be between 1 and 100" };
        }

        const chainId = query.chainId ? parseChainId(query.chainId) : undefined;
        if (query.chainId && chainId === null) {
          return {
            status: "error",
            message: `Invalid chainId. Allowed: ${SUPPORTED_CHAIN_IDS.join(", ")}`,
          };
        }

        const data = await getTopHolders({ limit, chainId: chainId ?? undefined });
        return { status: "ok", data };
      } catch (error) {
        console.error("Top holders error:", error);
        return { status: "error", message: String(error) };
      }
    },
    {
      query: t.Object({
        limit: t.Optional(t.String()),
        chainId: t.Optional(t.String()),
      }),
    }
  )
  .get("/wallet/:address", async ({ params }) => {
    if (!isValidEthereumAddress(params.address)) {
      return { status: "error", message: "Invalid address format" };
    }

    try {
      const data = await getWalletBalanceData(params.address);
      return { status: "ok", data };
    } catch (error) {
      return { status: "error", message: String(error) };
    }
  });

export const GET = app.fetch;
export const POST = app.fetch;

export type App = typeof app;
