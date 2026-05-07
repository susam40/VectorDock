"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PipelineStep } from "@/lib/types";
import { cn } from "@/lib/utils";
import { pipelineStepStatusTr } from "@/lib/tr";

export function PipelineVisualizer({ steps }: { steps: PipelineStep[] }) {
  const formatSeconds = (ms: number) => `${(ms / 1000).toFixed(2)} sn`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Hat izi</CardTitle>
        <CardDescription>Aşama başına gecikme ve girdi/çıktı</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((s, i) => (
          <div key={s.id} className="flex gap-3">
            <div className="text-muted-foreground w-6 shrink-0 text-right text-xs font-mono">
              {i + 1}
            </div>
            <div className="border-border bg-muted/20 min-w-0 flex-1 rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{s.name}</span>
                <Badge
                  variant={s.status === "error" ? "destructive" : "outline"}
                >
                  {pipelineStepStatusTr[s.status]}
                </Badge>
                <span className="text-muted-foreground font-mono text-xs">
                  {formatSeconds(s.latencyMs)}
                </span>
              </div>
              {s.input ? (
                <p className="text-muted-foreground mt-2 text-xs">
                  <span className="font-semibold">Girdi:</span>{" "}
                  <span className={cn("break-all", s.input.length > 200 && "line-clamp-3")}>
                    {s.input}
                  </span>
                </p>
              ) : null}
              {s.output ? (
                <p className="text-muted-foreground mt-1 text-xs">
                  <span className="font-semibold">Çıktı:</span>{" "}
                  <span className="break-all">{s.output}</span>
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
