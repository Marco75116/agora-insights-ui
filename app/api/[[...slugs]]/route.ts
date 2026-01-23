import { Elysia, t } from "elysia";
import clickhouseClient from "@/lib/clients/clickhouse.client";
import { getAusdMetrics, getTransferStatsDaily } from "@/lib/services/ausd.service";
import { SUPPORTED_CHAIN_IDS, type ChainId } from "@/constants/chains";

const app = new Elysia({ prefix: "/api" })
  .get("/hello", () => ({ message: "Hello from Elysia!" }))
  .get("/clickhouse/health", async () => {
    try {
      const result = await clickhouseClient.query({
        query: "SELECT version() as version",
        format: "JSONEachRow",
      });
      const data = (await result.json()) as Array<{ version: string }>;
      return { status: "ok", version: data[0].version };
    } catch (error) {
      console.error("ClickHouse error:", error);
      return { status: "error", message: String(error) };
    }
  })
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
  .get("/users", () => [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]);

export const GET = app.fetch;
export const POST = app.fetch;

export type App = typeof app;
