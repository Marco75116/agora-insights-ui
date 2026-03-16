import { getLastBlockByChain } from "@/lib/services/ausd.service";
import { LastBlockInfo } from "@/components/analytics/LastBlockInfo";

export async function LastBlockInfoSection() {
  const lastBlockByChain = await getLastBlockByChain();

  return (
    <LastBlockInfo lastUpdated={new Date().toISOString()} lastBlockByChain={lastBlockByChain} />
  );
}
