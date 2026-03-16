import { getAusdMetrics } from "@/lib/services/ausd.service";
import { ChainBreakdownChart } from "@/components/analytics/ChainBreakdownChart";

export async function ChainBreakdownSection() {
  const data = await getAusdMetrics();

  return (
    <>
      <ChainBreakdownChart data={data.chainBreakdown} metric="supply" isLoading={false} />
      <ChainBreakdownChart data={data.chainBreakdown} metric="holders" isLoading={false} />
    </>
  );
}
