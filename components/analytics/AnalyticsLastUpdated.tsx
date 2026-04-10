import { cacheLife } from "next/cache";
import { LastUpdated } from "@/components/shared/LastUpdated";
import { getAusdMetrics } from "@/lib/services/ausd.service";

async function fetchLastUpdated(): Promise<string | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });

  try {
    const data = await getAusdMetrics();
    return data.lastUpdated;
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
