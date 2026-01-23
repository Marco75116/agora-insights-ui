"use client";

import { useParams } from "next/navigation";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { BalanceCard } from "@/components/wallet/BalanceCard";
import { BalanceHistoryChart } from "@/components/wallet/BalanceHistoryChart";
import { MetricCardSkeleton } from "@/components/analytics/MetricCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { SUPPORTED_CHAIN_IDS } from "@/constants/chains";

export default function WalletPage() {
  const params = useParams();
  const address = (params.address as string)?.toLowerCase();

  const { data, isLoading, error } = useWalletBalance(address);

  if (!address) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No wallet address provided</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Failed to load wallet data: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Wallet Balance</h1>
        <p className="text-muted-foreground font-mono text-sm">{address}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? SUPPORTED_CHAIN_IDS.map((chainId) => <MetricCardSkeleton key={chainId} />)
          : data?.balances.map((balance) => (
              <BalanceCard
                key={balance.chainId}
                chainId={balance.chainId}
                balance={balance.balance}
              />
            ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading
          ? SUPPORTED_CHAIN_IDS.map((chainId) => (
              <div key={chainId} className="rounded-lg border p-6">
                <Skeleton className="mb-4 h-6 w-48" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ))
          : data?.history.map((history) => (
              <BalanceHistoryChart key={history.chainId} data={history} />
            ))}
      </div>

      {data?.lastUpdated && (
        <p className="text-muted-foreground text-xs">
          Last updated: {new Date(data.lastUpdated).toLocaleString()}
        </p>
      )}
    </div>
  );
}
