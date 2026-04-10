import { cacheLife } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChainSelect } from "@/components/analytics/ChainSelect";
import { type ChainId } from "@/constants/chains";
import type { TopHoldersResponse, ApiResponse } from "@/types/Analytics";
import { TopHoldersTable } from "@/components/analytics/TopHoldersTable";
import { env } from "@/lib/env";

async function fetchTopHolders(
  chainId: ChainId,
  limit: number
): Promise<TopHoldersResponse | null> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });

  try {
    const url = new URL(`${env.NEXT_PUBLIC_BASE_URL}/api/ausd/top-holders`);
    url.searchParams.set("limit", limit.toString());
    url.searchParams.set("chainId", chainId.toString());

    const response = await fetch(url);
    const result: ApiResponse<TopHoldersResponse> = await response.json();

    if (result.status === "error" || !result.data) {
      console.error("[TopHoldersSection] API error:", result.message);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error("[TopHoldersSection] Fetch failed:", error);
    return null;
  }
}

interface TopHoldersSectionProps {
  chainId: ChainId;
}

export async function TopHoldersSection({ chainId }: TopHoldersSectionProps) {
  const data = await fetchTopHolders(chainId, 8);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Top Holders
        </CardTitle>
        <ChainSelect paramKey="holdersChainId" value={chainId} />
      </CardHeader>
      <CardContent className="pt-1">
        {data ? (
          <TopHoldersTable holders={data.holders} />
        ) : (
          <p className="text-muted-foreground text-sm">
            Top holders data is temporarily unavailable.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
