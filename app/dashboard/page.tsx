import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AddressSearchCard } from "@/components/wallet/AddressSearchCard";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back, {session?.user?.name || "User"}
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor AUSD balances and analytics across chains
          </p>
        </div>
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
          <AddressSearchCard />
          <AnalyticsCard />
        </div>
      </div>
    </div>
  );
}
