import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { isValidEthereumAddress } from "@/lib/helpers/address";
import { CHAINS, SUPPORTED_CHAIN_IDS } from "@/constants/chains";
import { ChartSkeleton } from "@/components/analytics/ChartSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletBalanceSection } from "@/components/wallet/WalletBalanceSection";

function WalletBalanceFallback() {
  return (
    <>
      <div className="md:max-w-[50%]">
        <ChartSkeleton title="AUSD Balances" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {SUPPORTED_CHAIN_IDS.map((chainId) => (
          <ChartSkeleton key={chainId} title={`${CHAINS[chainId].name} Balance History`} />
        ))}
      </div>
      <Skeleton className="h-4 w-64" />
    </>
  );
}

interface PageProps {
  params: Promise<{ address: string }>;
}

export default async function WalletPage({ params }: PageProps) {
  const { address: rawAddress } = await params;
  const address = rawAddress?.toLowerCase();
  const isInvalidAddress = address && !isValidEthereumAddress(address);

  if (!address) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No wallet address provided</p>
      </div>
    );
  }

  if (isInvalidAddress) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Wallet Balance</h1>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground min-w-0 truncate font-mono text-xs sm:text-sm">
              {address}
            </p>
            <Badge variant="destructive">Invalid format</Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-balance">Wallet Balance</h1>
        <p className="text-muted-foreground min-w-0 truncate font-mono text-xs sm:text-sm">
          {address}
        </p>
      </div>

      <Suspense fallback={<WalletBalanceFallback />}>
        <WalletBalanceSection address={address} />
      </Suspense>
    </div>
  );
}
