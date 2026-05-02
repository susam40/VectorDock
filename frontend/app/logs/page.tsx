"use client";

import { Header } from "@/components/layout/Header";
import { LogViewer } from "@/components/logs/LogViewer";
import { TraceViewer } from "@/components/logs/TraceViewer";
import { useLogs } from "@/lib/hooks/useLogs";
import { Skeleton } from "@/components/ui/skeleton";

export default function LogsPage() {
  const { data, isLoading } = useLogs();

  return (
    <>
      <Header
        title="Günlükler ve izleme"
        description="Alım, sorgu ve hata izleri — backend hazır olunca OpenTelemetry aktarımına geçilebilir."
      />
      <main className="flex-1 space-y-6 p-6">
        <TraceViewer entries={data ?? []} />
        {isLoading || !data ? (
          <Skeleton className="h-[600px] w-full" />
        ) : (
          <LogViewer logs={data} />
        )}
      </main>
    </>
  );
}
