"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransferStats } from "@/hooks/useTransferStats";
import { TransferStatsChart } from "@/components/analytics/TransferStatsChart";
import { CollapsibleChartSection } from "@/components/analytics/CollapsibleChartSection";
import { ChartSkeleton } from "@/components/analytics/ChartSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CHAINS, SUPPORTED_CHAIN_IDS, type ChainId } from "@/constants/chains";

const MONTH_OPTIONS = [
  { value: "1", label: "Last month" },
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
];

interface TransferStatsSectionProps {
  initialMonths?: number;
  initialChainId?: ChainId;
}

export function TransferStatsSection({
  initialMonths = 1,
  initialChainId,
}: TransferStatsSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const months = searchParams.get("months")
    ? parseInt(searchParams.get("months")!, 10)
    : initialMonths;
  const chainId = searchParams.get("chainId")
    ? (parseInt(searchParams.get("chainId")!, 10) as ChainId)
    : initialChainId;

  const { data: transferStats, isLoading, error } = useTransferStats({ months, chainId });

  function updateParams(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <CollapsibleChartSection
      title="Transfer Statistics"
      description="Daily transfer counts and volume"
      defaultOpen
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={months.toString()}
            onValueChange={(value) => updateParams("months", value)}
          >
            <SelectTrigger className="w-[160px]" aria-label="Select time period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={chainId?.toString() ?? "all"}
            onValueChange={(value) => updateParams("chainId", value)}
          >
            <SelectTrigger className="w-[160px]" aria-label="Select chain">
              <SelectValue placeholder="All chains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chains</SelectItem>
              {SUPPORTED_CHAIN_IDS.map((id) => (
                <SelectItem key={id} value={id.toString()}>
                  {CHAINS[id].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {isLoading ? (
            <>
              <ChartSkeleton height={300} />
              <ChartSkeleton height={300} />
            </>
          ) : error ? (
            <p className="text-destructive col-span-2">
              Failed to load transfer stats: {error.message}
            </p>
          ) : transferStats?.stats && transferStats.stats.length > 0 ? (
            <>
              <TransferStatsChart data={transferStats.stats} metric="transfers" />
              <TransferStatsChart data={transferStats.stats} metric="volume" />
            </>
          ) : (
            <p className="text-muted-foreground col-span-2">No transfer data available</p>
          )}
        </div>
      </div>
    </CollapsibleChartSection>
  );
}
