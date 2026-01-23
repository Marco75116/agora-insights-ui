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

export async function loadClients(): Promise<{
  clickhouse: boolean;
}> {
  console.log("\nChecking database connections...\n");

  const clickhouse = await checkClickhouseConnection();

  console.log("");

  return { clickhouse };
}

export { clickhouseClient };
