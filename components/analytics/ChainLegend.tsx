"use client";

import { CHAINS, SUPPORTED_CHAIN_IDS } from "@/constants/chains";
import { useIsCompactLayout } from "@/hooks/use-layout-width";

export function ChainLegend() {
  const isCompact = useIsCompactLayout();

  if (!isCompact) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Chain legend">
      {SUPPORTED_CHAIN_IDS.map((chainId) => {
        const chain = CHAINS[chainId];
        return (
          <div key={chainId} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: chain.color }}
              aria-hidden="true"
            />
            <span className="text-sm">{chain.name}</span>
          </div>
        );
      })}
    </div>
  );
}
