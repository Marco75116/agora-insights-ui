import { cacheLife } from "next/cache";
import { ChainBreakdownChart } from "@/components/analytics/ChainBreakdownChart";
import type { AusdOverviewMetrics, ApiResponse } from "@/types/Analytics";
import { env } from "@/lib/env";

async function fetchAusdOverview(): Promise<AusdOverviewMetrics> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });

  const response = await fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/ausd/overview`);
  const result: ApiResponse<AusdOverviewMetrics> = await response.json();

  if (result.status === "error" || !result.data) {
    throw new Error(result.message ?? "Failed to fetch AUSD overview");
  }

  return result.data;
}

export async function ChainBreakdownSection() {
  const data = await fetchAusdOverview();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <ChainBreakdownChart data={data.chainBreakdown} metric="supply" isLoading={false} />
        <ChainBreakdownChart data={data.chainBreakdown} metric="holders" isLoading={false} />
      </div>
      <p className="text-muted-foreground text-xs">
        Last updated:{" "}
        {new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(data.lastUpdated))}
      </p>
    </div>
  );
}
