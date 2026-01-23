"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMintBurnStats } from "@/hooks/useMintBurnStats";
import { MintBurnStatsChart } from "@/components/analytics/MintBurnStatsChart";
import { CollapsibleChartSection } from "@/components/analytics/CollapsibleChartSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CHAINS, SUPPORTED_CHAIN_IDS, type ChainId } from "@/constants/chains";

const MONTH_OPTIONS = [
  { value: "1", label: "Last month" },
  { value: "3", label: "Last 3 months" },
  { value: "6", label: "Last 6 months" },
  { value: "12", label: "Last 12 months" },
];

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}

interface MintBurnStatsSectionProps {
  initialMonths?: number;
  initialChainId?: ChainId;
}

export function MintBurnStatsSection({
  initialMonths = 1,
  initialChainId,
}: MintBurnStatsSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const months = searchParams.get("mintBurnMonths")
    ? parseInt(searchParams.get("mintBurnMonths")!, 10)
    : initialMonths;
  const chainId = searchParams.get("mintBurnChainId")
    ? (parseInt(searchParams.get("mintBurnChainId")!, 10) as ChainId)
    : initialChainId;

  const { data: mintBurnStats, isLoading, error } = useMintBurnStats({ months, chainId });

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
      title="Mint & Burn Statistics"
      description="Daily mint and burn activity"
      defaultOpen
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={months.toString()}
            onValueChange={(value) => updateParams("mintBurnMonths", value)}
          >
            <SelectTrigger className="w-[160px]">
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
            onValueChange={(value) => updateParams("mintBurnChainId", value)}
          >
            <SelectTrigger className="w-[160px]">
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
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : error ? (
            <p className="text-destructive col-span-2">
              Failed to load mint/burn stats: {error.message}
            </p>
          ) : mintBurnStats?.stats && mintBurnStats.stats.length > 0 ? (
            <>
              <MintBurnStatsChart data={mintBurnStats.stats} metric="mint" type="count" />
              <MintBurnStatsChart data={mintBurnStats.stats} metric="mint" type="volume" />
              <MintBurnStatsChart data={mintBurnStats.stats} metric="burn" type="count" />
              <MintBurnStatsChart data={mintBurnStats.stats} metric="burn" type="volume" />
            </>
          ) : (
            <p className="text-muted-foreground col-span-2">No mint/burn data available</p>
          )}
        </div>
      </div>
    </CollapsibleChartSection>
  );
}
