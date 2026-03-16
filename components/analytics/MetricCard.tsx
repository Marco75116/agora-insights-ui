import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  accentColor?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  accentColor,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {accentColor && (
        <div
          className="absolute top-0 left-0 h-full w-1 rounded-l-xl"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />
      )}
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight tabular-nums">{value}</div>
        {subtitle && <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
