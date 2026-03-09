"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CHAINS, SUPPORTED_CHAIN_IDS, type ChainId } from "@/constants/chains";

interface ChainSelectProps {
  paramKey: string;
  value: ChainId;
}

export function ChainSelect({ paramKey, value }: ChainSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChainChange(newValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramKey, newValue);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <Select value={String(value)} onValueChange={onChainChange}>
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
  );
}
