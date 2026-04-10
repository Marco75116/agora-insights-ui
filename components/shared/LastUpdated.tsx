interface LastUpdatedProps {
  timestamp: string;
  className?: string;
}

export function LastUpdated({ timestamp, className }: LastUpdatedProps) {
  return (
    <p className={className ?? "text-muted-foreground text-xs"}>
      Last updated:{" "}
      {new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(timestamp))}
    </p>
  );
}
