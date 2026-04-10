import { cacheLife } from "next/cache";
import { LastUpdated } from "@/components/shared/LastUpdated";
import type { AusdOverviewMetrics, ApiResponse } from "@/types/Analytics";
import { env } from "@/lib/env";

async function fetchLastUpdated(): Promise<string | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });

  try {
    const response = await fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/ausd/overview`);
    const result: ApiResponse<AusdOverviewMetrics> = await response.json();

    if (result.status === "error" || !result.data) {
      console.error("[AnalyticsLastUpdated] API error:", result.message);
      return null;
    }

    return result.data.lastUpdated;
  } catch (error) {
    console.error("[AnalyticsLastUpdated] Fetch failed:", error);
    return null;
  }
}

export async function AnalyticsLastUpdated() {
  const lastUpdated = await fetchLastUpdated();

  if (!lastUpdated) return null;

  return <LastUpdated timestamp={lastUpdated} />;
}
