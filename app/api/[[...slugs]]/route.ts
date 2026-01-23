import { Elysia } from "elysia";
import clickhouseClient from "@/lib/clients/clickhouse.client";

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
  .get("/users", () => [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ]);

export const GET = app.fetch;
export const POST = app.fetch;

export type App = typeof app;
