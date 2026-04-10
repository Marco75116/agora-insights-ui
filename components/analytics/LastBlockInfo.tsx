import { CHAINS } from "@/constants/chains";
import { formatNumber } from "@/lib/helpers/formatters";
import { LastUpdated } from "@/components/shared/LastUpdated";
import type { LastBlockByChain } from "@/types/Analytics";

interface LastBlockInfoProps {
  lastUpdated: string;
  lastBlockByChain: LastBlockByChain[];
}

export function LastBlockInfo({ lastUpdated, lastBlockByChain }: LastBlockInfoProps) {
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      <LastUpdated timestamp={lastUpdated} className="text-muted-foreground text-xs" />
      <span className="hidden sm:inline">·</span>
      <span className="flex flex-wrap gap-x-3 gap-y-1">
        {lastBlockByChain.map(({ chainId, blockNumber }) => (
          <span key={chainId}>
            {CHAINS[chainId].shortName} #{formatNumber(blockNumber)}
          </span>
        ))}
      </span>
    </div>
  );
}
