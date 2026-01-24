import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface ChartSkeletonProps {
  title?: string;
  height?: number;
}

export function ChartSkeleton({ title, height = 200 }: ChartSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        {title ? (
          <span className="text-base font-semibold">{title}</span>
        ) : (
          <Skeleton className="h-5 w-32" />
        )}
      </CardHeader>
      <CardContent>
        <div className="bg-muted/50 flex items-center justify-center rounded-md" style={{ height }}>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading chart...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
