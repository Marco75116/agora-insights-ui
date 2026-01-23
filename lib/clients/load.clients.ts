import clickhouseClient from "@/lib/clients/clickhouse.client";

async function checkClickhouseConnection(): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout")), 5000)
    );
    const result = await Promise.race([clickhouseClient.ping(), timeoutPromise]);
    if (result.success) {
      console.log("✓ ClickHouse: Connected");
      return true;
    }
    console.log("✗ ClickHouse: Not connected -", result.error?.message ?? "Ping failed");
    return false;
  } catch (error) {
    console.log(
      "✗ ClickHouse: Not connected -",
      error instanceof Error ? error.message : "Unknown error"
    );
    return false;
  }
}

async function checkPostgresConnection(): Promise<boolean> {
  try {
    const { db } = await import("@/lib/db");
    const { sql } = await import("drizzle-orm");
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout")), 5000)
    );
    await Promise.race([db.execute(sql`SELECT 1`), timeoutPromise]);
    console.log("✓ PostgreSQL: Connected");
    return true;
  } catch (error) {
    console.log(
      "✗ PostgreSQL: Not connected -",
      error instanceof Error ? error.message : "Unknown error"
    );
    return false;
  }
}

export async function loadClients(): Promise<{
  clickhouse: boolean;
  postgres: boolean;
}> {
  console.log("\nChecking database connections...\n");

  const [clickhouse, postgres] = await Promise.all([
    checkClickhouseConnection(),
    checkPostgresConnection(),
  ]);

  console.log("");

  return { clickhouse, postgres };
}

export { clickhouseClient };
