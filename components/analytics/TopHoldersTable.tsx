import Link from "next/link";
import { AUSD_DECIMALS } from "@/constants/chains";
import { formatTokenAmount } from "@/lib/helpers/formatters";
import type { TopHolder } from "@/types/Analytics";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function HolderRow({ holder, rank }: { holder: TopHolder; rank: number }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground w-4 text-right font-mono text-xs tabular-nums">
          {rank}
        </span>
        <Link
          href={`/dashboard/wallet/${holder.walletAddress}`}
          className="font-mono text-xs underline decoration-dotted underline-offset-4 transition-colors hover:text-blue-500"
        >
          {truncateAddress(holder.walletAddress)}
        </Link>
      </div>
      <span className="font-mono text-xs tabular-nums">
        {formatTokenAmount(holder.totalBalance, AUSD_DECIMALS)}
      </span>
    </div>
  );
}

interface TopHoldersTableProps {
  holders: TopHolder[];
}

export function TopHoldersTable({ holders }: TopHoldersTableProps) {
  return (
    <>
      <div className="text-muted-foreground flex items-center justify-between border-b pb-1.5 text-xs">
        <span>Address</span>
        <span>Balance (AUSD)</span>
      </div>
      <div className="divide-y">
        {holders.map((holder, i) => (
          <HolderRow key={holder.walletAddress} holder={holder} rank={i + 1} />
        ))}
      </div>
    </>
  );
}
