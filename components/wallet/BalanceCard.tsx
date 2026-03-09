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

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{chain.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">
          {formatTokenAmount(balance, AUSD_DECIMALS)}
        </div>
        <p className="text-muted-foreground text-xs">AUSD Balance</p>
      </CardContent>
    </Card>
  );
}
