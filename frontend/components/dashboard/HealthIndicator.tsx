import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { healthTr } from "@/lib/tr";

const map = {
  healthy: "bg-green-600/15 text-green-700 dark:text-green-400 border-green-600/30",
  degraded: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
  down: "bg-destructive/15 text-destructive border-destructive/30",
};

export function HealthIndicator({
  label,
  status,
}: {
  label: string;
  status: "healthy" | "degraded" | "down";
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      <Badge variant="outline" className={cn(map[status])}>
        {healthTr[status]}
      </Badge>
    </div>
  );
}
