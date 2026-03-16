import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHAINS, AUSD_DECIMALS, type ChainId } from "@/constants/chains";
import { formatTokenAmount } from "@/lib/helpers/formatters";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  chainId: ChainId;
  balance: string;
  className?: string;
}

export function BalanceCard({ chainId, balance, className }: BalanceCardProps) {
  const chain = CHAINS[chainId];
  const formattedBalance = formatTokenAmount(balance, AUSD_DECIMALS);
  const isZero = !balance || balance === "0";

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div
        className="absolute top-0 left-0 h-full w-1 rounded-l-xl"
        style={{ backgroundColor: chain.color }}
        aria-hidden="true"
      />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{chain.name}</CardTitle>
        <span className="text-muted-foreground text-xs font-medium">{chain.shortName}</span>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-2xl font-bold tracking-tight tabular-nums",
            isZero && "text-muted-foreground"
          )}
        >
          {formattedBalance}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">AUSD Balance</p>
      </CardContent>
    </Card>
  );
}
