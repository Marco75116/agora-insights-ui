import { cacheLife } from "next/cache";
import { LastUpdated } from "@/components/shared/LastUpdated";
import type { AusdOverviewMetrics, ApiResponse } from "@/types/Analytics";
import { env } from "@/lib/env";

async function fetchLastUpdated(): Promise<string> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });

  const response = await fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/ausd/overview`);
  const result: ApiResponse<AusdOverviewMetrics> = await response.json();

  if (result.status === "error" || !result.data) {
    throw new Error(result.message ?? "Failed to fetch last updated time");
  }

  return result.data.lastUpdated;
}

export async function AnalyticsLastUpdated() {
  const lastUpdated = await fetchLastUpdated();

  return <LastUpdated timestamp={lastUpdated} />;
}
