"use client";

import { useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Welcome back, {session?.user?.name || "User"}</h1>
    </div>
  );
}
