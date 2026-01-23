import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export function MetricCard({ title, value, subtitle, icon, className }: MetricCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
