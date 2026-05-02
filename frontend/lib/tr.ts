import type { DocStatus, LogType } from "@/lib/types";

/** Arayüz metinleri — tek kaynak */
export const nav = {
  dashboard: "Gösterge paneli",
  documents: "Belgeler",
  playground: "Sorgu laboratuvarı",
  collections: "Koleksiyonlar",
  logs: "Günlükler",
} as const;

export const docStatusTr: Record<DocStatus, string> = {
  pending: "Beklemede",
  parsing: "Ayrıştırılıyor",
  embedding: "Gömme yapılıyor",
  ready: "Hazır",
  failed: "Başarısız",
};

export const embStatusTr: Record<
  "pending" | "partial" | "complete",
  string
> = {
  pending: "Beklemede",
  partial: "Kısmi",
  complete: "Tamamlandı",
};

export const healthTr: Record<"healthy" | "degraded" | "down", string> = {
  healthy: "Sağlıklı",
  degraded: "Düşük performans",
  down: "Çevrimdışı",
};

export const logTypeTr: Record<LogType, string> = {
  ingestion: "Alım",
  query: "Sorgu",
  error: "Hata",
  system: "Sistem",
};

export const pipelineStepStatusTr: Record<
  "success" | "skipped" | "error",
  string
> = {
  success: "Başarılı",
  skipped: "Atlandı",
  error: "Hata",
};

export const chunkStrategyTr: Record<"fixed" | "semantic", string> = {
  fixed: "Sabit",
  semantic: "Anlamsal",
};
