"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LogEntry } from "@/lib/types";

export function TraceViewer({ entries }: { entries: LogEntry[] }) {
  const traces = entries.filter((e) => e.type === "query" && e.traceId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Son sorgu izleri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 font-mono text-xs">
        {traces.length === 0 ? (
          <p className="text-muted-foreground">Örnek kümede sorgu izi yok.</p>
        ) : (
          traces.map((t) => (
            <div key={t.id} className="border-border rounded border p-3">
              <div>{t.traceId}</div>
              <div className="text-muted-foreground mt-1">{t.message}</div>
              {t.payload ? (
                <pre className="bg-muted/40 mt-2 overflow-x-auto rounded p-2">
                  {JSON.stringify(t.payload)}
                </pre>
              ) : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
