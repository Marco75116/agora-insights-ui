import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHAINS, AUSD_DECIMALS, SUPPORTED_CHAIN_IDS, type ChainId } from "@/constants/chains";
import { formatTokenAmount } from "@/lib/helpers/formatters";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceData {
  chainId: ChainId;
  balance: string;
}

interface WalletBalanceTableProps {
  balances: BalanceData[];
  isLoading: boolean;
}

function RowSkeleton() {
  return (
    <div className="flex items-center justify-between py-2.5">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
}

export function WalletBalanceTable({ balances, isLoading }: WalletBalanceTableProps) {
  const resolvedBalances =
    balances.length > 0
      ? balances
      : SUPPORTED_CHAIN_IDS.map((chainId) => ({ chainId, balance: "0" }));

  return (
    <Card className="max-w-md">
      <CardHeader className="pb-0">
        <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          AUSD Balances
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-muted-foreground flex items-center justify-between border-b pb-2 text-xs">
          <span>Chain</span>
          <span>Balance</span>
        </div>
        <div className="divide-y">
          {isLoading
            ? SUPPORTED_CHAIN_IDS.map((chainId) => <RowSkeleton key={chainId} />)
            : resolvedBalances.map((item) => {
                const config = CHAINS[item.chainId];
                const isZero = !item.balance || item.balance === "0";
                return (
                  <div key={item.chainId} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: config.color }}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium">{config.name}</span>
                      <span className="text-muted-foreground text-xs">{config.shortName}</span>
                    </div>
                    <span
                      className={`font-mono text-sm tabular-nums ${isZero ? "text-muted-foreground" : ""}`}
                    >
                      {formatTokenAmount(item.balance, AUSD_DECIMALS)}
                    </span>
                  </div>
                );
              })}
        </div>
      </CardContent>
    </Card>
  );
}
