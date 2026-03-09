"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTopHolders } from "@/hooks/useTopHolders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CHAINS,
  AUSD_DECIMALS,
  CHAIN_IDS,
  SUPPORTED_CHAIN_IDS,
  type ChainId,
} from "@/constants/chains";
import { formatTokenAmount } from "@/lib/helpers/formatters";
import type { TopHolder } from "@/types/Analytics";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getExplorerLink(address: string, chainId: ChainId): string {
  return `${CHAINS[chainId].explorerUrl}/address/${address}`;
}

function RowSkeleton() {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-4" />
        <Skeleton className="h-3.5 w-24" />
      </div>
      <Skeleton className="h-3.5 w-20" />
    </div>
  );
}

function HolderRow({
  holder,
  rank,
  chainId,
}: {
  holder: TopHolder;
  rank: number;
  chainId: ChainId;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground w-4 text-right font-mono text-xs tabular-nums">
          {rank}
        </span>
        <a
          href={getExplorerLink(holder.walletAddress, chainId)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs underline decoration-dotted underline-offset-4 transition-colors hover:text-blue-500"
        >
          {truncateAddress(holder.walletAddress)}
        </a>
      </div>
      <span className="font-mono text-xs tabular-nums">
        {formatTokenAmount(holder.totalBalance, AUSD_DECIMALS)}
      </span>
    </div>
  );
}

export function TopHoldersSection() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const chainIdParam = searchParams.get("holdersChainId");
  const chainId = chainIdParam
    ? (parseInt(chainIdParam, 10) as ChainId)
    : (CHAIN_IDS.ETHEREUM as ChainId);

  const { data, isLoading, error } = useTopHolders(chainId);

  function onChainChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("holdersChainId", value);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  if (error) {
    return <p className="text-destructive">Failed to load top holders: {error.message}</p>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-1">
          <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Top Holders
          </CardTitle>
          <Select value={String(chainId)} onValueChange={onChainChange}>
            <SelectTrigger className="h-7 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CHAIN_IDS.map((id) => (
                <SelectItem key={id} value={String(id)}>
                  {CHAINS[id].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="text-muted-foreground flex items-center justify-between border-b pb-1.5 text-xs">
            <span>Address</span>
            <span>Balance (AUSD)</span>
          </div>
          <div className="divide-y">
            {isLoading
              ? Array.from({ length: 5 }, (_, i) => <RowSkeleton key={i} />)
              : data?.holders.map((holder, i) => (
                  <HolderRow
                    key={holder.walletAddress}
                    holder={holder}
                    rank={i + 1}
                    chainId={chainId}
                  />
                ))}
          </div>
        </CardContent>
      </Card>
      {data?.lastUpdated && (
        <p className="text-muted-foreground text-xs">
          Last updated:{" "}
          {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
            new Date(data.lastUpdated)
          )}
        </p>
      )}
    </>
  );
}
