import { cacheLife } from "next/cache";
import { getTotalSupplyDaily } from "@/lib/services/ausd.service";
import { TotalSupplyChart } from "@/components/analytics/TotalSupplyChart";
import type { ChainId } from "@/constants/chains";
import type { TotalSupplyDailyResponse } from "@/types/Analytics";

async function fetchTotalSupplyDaily(
  months: number,
  chainId: ChainId
): Promise<TotalSupplyDailyResponse | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });

  try {
    return await getTotalSupplyDaily({ months, chainId });
  } catch (error) {
    console.error("[TotalSupplySection] Fetch failed:", error);
    return null;
  }
}

interface TotalSupplySectionProps {
  months: number;
  chainId: ChainId;
}

export async function TotalSupplySection({ months, chainId }: TotalSupplySectionProps) {
  const supplyData = await fetchTotalSupplyDaily(months, chainId);

  if (!supplyData?.stats || supplyData.stats.length === 0) {
    return <p className="text-muted-foreground">No supply data available</p>;
  }

  return <TotalSupplyChart supplyData={supplyData.stats} chainId={chainId} months={months} />;
}
