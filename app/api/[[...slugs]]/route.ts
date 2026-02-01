import { Elysia, t } from "elysia";
import {
  getAusdMetrics,
  getTransferStatsDaily,
  getMintBurnStatsDaily,
} from "@/lib/services/ausd.service";
import { getWalletBalanceData } from "@/lib/services/wallet.service";
import { isValidEthereumAddress } from "@/lib/helpers/address";
import { SUPPORTED_CHAIN_IDS, type ChainId } from "@/constants/chains";

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
        const months = query.months ? parseInt(query.months, 10) : 1;
        const chainId = query.chainId ? parseInt(query.chainId, 10) : undefined;

        const validChainId =
          chainId && SUPPORTED_CHAIN_IDS.includes(chainId as ChainId)
            ? (chainId as ChainId)
            : undefined;

        const stats = await getTransferStatsDaily({
          months,
          chainId: validChainId,
        });
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
        const months = query.months ? parseInt(query.months, 10) : 1;
        const chainId = query.chainId ? parseInt(query.chainId, 10) : undefined;

        const validChainId =
          chainId && SUPPORTED_CHAIN_IDS.includes(chainId as ChainId)
            ? (chainId as ChainId)
            : undefined;

        const stats = await getMintBurnStatsDaily({
          months,
          chainId: validChainId,
        });
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
