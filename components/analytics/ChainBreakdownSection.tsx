import { cacheLife } from "next/cache";
import { ChainBreakdownChart } from "@/components/analytics/ChainBreakdownChart";
import type { AusdOverviewMetrics, ApiResponse } from "@/types/Analytics";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

async function fetchAusdOverview(): Promise<AusdOverviewMetrics> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });

  const response = await fetch(`${BASE_URL}/api/ausd/overview`);
  const result: ApiResponse<AusdOverviewMetrics> = await response.json();

  if (result.status === "error" || !result.data) {
    throw new Error(result.message ?? "Failed to fetch AUSD overview");
  }

  return result.data;
}

export async function ChainBreakdownSection() {
  const data = await fetchAusdOverview();

  return (
    <>
      <ChainBreakdownChart data={data.chainBreakdown} metric="supply" isLoading={false} />
      <ChainBreakdownChart data={data.chainBreakdown} metric="holders" isLoading={false} />
    </>
  );
}
