import { Progress } from "@/components/ui/progress";

export function ChunkScore({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="font-mono">{pct}%</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}
