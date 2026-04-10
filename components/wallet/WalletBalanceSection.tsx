import { cacheLife } from "next/cache";
import { WalletBalanceCard } from "@/components/wallet/WalletBalanceCard";
import { BalanceHistoryChart } from "@/components/wallet/BalanceHistoryChart";
import { LastUpdated } from "@/components/shared/LastUpdated";
import { SUPPORTED_CHAIN_IDS } from "@/constants/chains";
import { env } from "@/lib/env";
import type { WalletBalanceData } from "@/types/WalletBalance";
import type { ApiResponse } from "@/types/Analytics";

async function fetchWalletData(address: string): Promise<WalletBalanceData> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });

  const response = await fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/wallet/${address}`);
  const result: ApiResponse<WalletBalanceData> = await response.json();

  if (result.status === "error" || !result.data) {
    throw new Error(result.message ?? "Failed to fetch wallet data");
  }

  return result.data;
}

interface WalletBalanceSectionProps {
  address: string;
}

export async function WalletBalanceSection({ address }: WalletBalanceSectionProps) {
  const data = await fetchWalletData(address);

  return (
    <>
      <div className="md:max-w-[50%]">
        <WalletBalanceCard balances={data.balances} isLoading={false} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SUPPORTED_CHAIN_IDS.filter((chainId) => {
          const history = data.history.find((h) => h.chainId === chainId);
          return history && history.snapshots.length > 0;
        }).map((chainId) => {
          const history = data.history.find((h) => h.chainId === chainId)!;
          return <BalanceHistoryChart key={chainId} data={history} walletAddress={address} />;
        })}
      </div>

      {data.lastUpdated && <LastUpdated timestamp={data.lastUpdated} />}
    </>
  );
}
