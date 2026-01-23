import Link from "next/link";
import { BarChart3, ArrowRight } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function AnalyticsCard() {
  return (
    <Link href="/dashboard/ausd-analytics" className="group">
      <Card className="hover:border-primary/50 flex h-full flex-row items-center gap-3 px-4 py-4 transition-colors">
        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <BarChart3 className="text-primary h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base">AUSD Analytics</CardTitle>
          <CardDescription className="text-xs">View metrics</CardDescription>
        </div>
        <ArrowRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-colors" />
      </Card>
    </Link>
  );
}
