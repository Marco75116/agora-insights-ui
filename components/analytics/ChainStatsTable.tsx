import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHAINS, AUSD_DECIMALS, type ChainId } from "@/constants/chains";
import { formatTokenAmount, formatNumber } from "@/lib/helpers/formatters";
import { Skeleton } from "@/components/ui/skeleton";

interface ChainData {
  chainId: ChainId;
  totalSupply: string;
  holdersCount: number;
}

interface ChainStatsTableProps {
  data: ChainData[];
  isLoading: boolean;
}

function RowSkeleton() {
  return (
    <div className="flex items-center justify-between py-2.5">
      <Skeleton className="h-4 w-20" />
      <div className="flex gap-8">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function ChainStatsTable({ data, isLoading }: ChainStatsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Chain Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-muted-foreground flex items-center justify-between border-b pb-2 text-xs">
          <span>Chain</span>
          <div className="flex gap-8">
            <span className="w-28 text-right">Supply</span>
            <span className="w-20 text-right">Holders</span>
          </div>
        </div>
        <div className="divide-y">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
            : data.map((chain) => {
                const config = CHAINS[chain.chainId];
                return (
                  <div key={chain.chainId} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: config.color }}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium">{config.name}</span>
                      <span className="text-muted-foreground text-xs">{config.shortName}</span>
                    </div>
                    <div className="flex gap-8">
                      <span className="w-28 text-right font-mono text-sm tabular-nums">
                        {formatTokenAmount(chain.totalSupply, AUSD_DECIMALS)}
                      </span>
                      <span className="text-muted-foreground w-20 text-right font-mono text-sm tabular-nums">
                        {formatNumber(chain.holdersCount)}
                      </span>
                    </div>
                  </div>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}
