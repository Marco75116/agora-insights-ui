import { cacheLife } from "next/cache";
import { ChainBreakdownChart } from "@/components/analytics/ChainBreakdownChart";
import type { AusdOverviewMetrics, ApiResponse } from "@/types/Analytics";
import { env } from "@/lib/env";

async function fetchAusdOverview(): Promise<AusdOverviewMetrics | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });

  try {
    const response = await fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/ausd/overview`);
    const result: ApiResponse<AusdOverviewMetrics> = await response.json();

    if (result.status === "error" || !result.data) {
      console.error("[ChainBreakdownSection] API error:", result.message);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("[ChainBreakdownSection] Fetch failed:", error);
    return null;
  }
}

export async function ChainBreakdownSection() {
  const data = await fetchAusdOverview();

  if (!data) {
    return (
      <p className="text-muted-foreground text-sm">
        Chain breakdown data is temporarily unavailable.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <ChainBreakdownChart data={data.chainBreakdown} metric="supply" isLoading={false} />
        <ChainBreakdownChart data={data.chainBreakdown} metric="holders" isLoading={false} />
      </div>
    </div>
  );
}
