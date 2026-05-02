"use client";

import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { HealthIndicator } from "@/components/dashboard/HealthIndicator";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { useActivity, useStats } from "@/lib/hooks/useStats";
import { formatBytes } from "@/lib/format";
import {
  Database,
  FileStack,
  FolderOpen,
  Gauge,
  Layers,
  Server,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: stats, isLoading: s1 } = useStats();
  const { data: activity, isLoading: s2 } = useActivity();

  return (
    <>
      <Header
        title="Gösterge paneli"
        description="Sistem sağlığı, ölçek sinyalleri ve aktivite — FastAPI bağlanana kadar örnek veri."
      />
      <main className="flex-1 space-y-6 p-6">
        {s1 || !stats ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatsCard
              title="Toplam belge"
              value={stats.totalDocuments}
              icon={<FileStack className="size-4" />}
            />
            <StatsCard
              title="İndekslenmiş parça"
              value={stats.indexedChunks}
              icon={<Layers className="size-4" />}
            />
            <StatsCard
              title="Aktif koleksiyon"
              value={stats.activeCollections}
              icon={<FolderOpen className="size-4" />}
            />
            <StatsCard
              title="Ort. sorgu gecikmesi"
              value={`${stats.avgQueryLatencyMs} ms`}
              hint="yaklaşık p50 (sentetik)"
              icon={<Gauge className="size-4" />}
            />
            <StatsCard
              title="Depolama kullanımı"
              value={formatBytes(stats.storageUsageBytes)}
              icon={<Database className="size-4" />}
            />
            <StatsCard
              title="Kuyruk / işler"
              value={`${stats.queueDepth} sırada`}
              hint={`${stats.activeJobs} aktif işçi`}
              icon={<Server className="size-4" />}
            />
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Sağlayıcılar ve indeks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {stats ? (
                <>
                  <p className="text-muted-foreground text-xs">
                    Gömme modeli:{" "}
                    <span className="text-foreground font-mono">
                      {stats.embeddingModel}
                    </span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    LLM:{" "}
                    <span className="text-foreground font-mono">
                      {stats.llmProvider}
                    </span>
                  </p>
                  <div className="border-border mt-3 border-t pt-3">
                    <HealthIndicator
                      label="Gömme API"
                      status={stats.health.embedding}
                    />
                    <HealthIndicator label="LLM" status={stats.health.llm} />
                    <HealthIndicator
                      label="Vektör veritabanı"
                      status={stats.health.vectorDb}
                    />
                  </div>
                </>
              ) : (
                <Skeleton className="h-32 w-full" />
              )}
            </CardContent>
          </Card>
          <div className="lg:col-span-2">
            {s2 || !activity ? (
              <Skeleton className="h-80 w-full rounded-lg" />
            ) : (
              <ActivityChart data={activity} />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
