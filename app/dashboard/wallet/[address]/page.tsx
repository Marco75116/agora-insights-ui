"use client";

import { useParams } from "next/navigation";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { WalletBalanceCard } from "@/components/wallet/WalletBalanceCard";
import { BalanceHistoryChart } from "@/components/wallet/BalanceHistoryChart";
import { ChartSkeleton } from "@/components/analytics/ChartSkeleton";
import { Badge } from "@/components/ui/badge";
import { isValidEthereumAddress } from "@/lib/helpers/address";
import { CHAINS, SUPPORTED_CHAIN_IDS } from "@/constants/chains";
import { LastBlockInfo } from "@/components/analytics/LastBlockInfo";

export default function WalletPage() {
  const params = useParams();
  const address = (params.address as string)?.toLowerCase();
  const isInvalidAddress = address && !isValidEthereumAddress(address);

  const { data, isLoading, error, isPending } = useWalletBalance(
    isInvalidAddress ? undefined : address
  );

  const showSkeleton = !isInvalidAddress && (isLoading || isPending || !data);

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
        <h1 className="text-2xl font-semibold text-balance">Wallet Balance</h1>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground font-mono text-sm break-all">{address}</p>
          {isInvalidAddress && <Badge variant="destructive">Invalid format</Badge>}
        </div>
      </div>

      <div className="max-w-[50%]">
        <WalletBalanceCard balances={data?.balances ?? []} isLoading={showSkeleton} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {showSkeleton
          ? SUPPORTED_CHAIN_IDS.map((chainId) => (
              <ChartSkeleton key={chainId} title={`${CHAINS[chainId].name} Balance History`} />
            ))
          : SUPPORTED_CHAIN_IDS.map((chainId) => {
              const history = data?.history.find((h) => h.chainId === chainId);
              return (
                <BalanceHistoryChart
                  key={chainId}
                  data={history ?? { chainId, snapshots: [] }}
                  walletAddress={address}
                />
              );
            })}
      </div>

      {data?.lastUpdated && (
        <LastBlockInfo lastUpdated={data.lastUpdated} lastBlockByChain={data.lastBlockByChain} />
      )}
    </div>
  );
}
