import Link from "next/link";
import { BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <BarChart3 className="text-primary h-5 w-5" />
          </div>
          <div>
            <CardTitle>AUSD Analytics</CardTitle>
            <CardDescription>View supply and holder metrics across chains</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/dashboard/ausd-analytics">
            View Analytics
            <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
