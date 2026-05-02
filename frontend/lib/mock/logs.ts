import type { LogEntry } from "@/lib/types";

export const MOCK_LOGS: LogEntry[] = [
  {
    id: "log-1",
    type: "ingestion",
    ts: new Date(Date.now() - 120000).toISOString(),
    message: "doc-5 ayrıştırıldı: 19 parça gömme için planlandı",
    traceId: "trace-ing-91a",
    payload: { documentId: "doc-5", chunks: 19 },
  },
  {
    id: "log-2",
    type: "query",
    ts: new Date(Date.now() - 90000).toISOString(),
    message: "Laboratuvar sorgusu tamamlandı — hibrit arama, yeniden sıralama açık",
    traceId: "trace-q-44c",
    payload: { latencyMs: 812, topK: 8 },
  },
  {
    id: "log-3",
    type: "error",
    ts: new Date(Date.now() - 3600000).toISOString(),
    message: "Gömme toplu iş yeniden deneme(1) — geçici sağlayıcı zaman aşımı",
    traceId: "trace-emb-3f2",
    payload: { provider: "openai", status: 524 },
  },
  {
    id: "log-4",
    type: "system",
    ts: new Date(Date.now() - 7200000).toISOString(),
    message: "Vektör indeks sıkıştırması bitti — segment birleştirme tamam",
    payload: { segments: 12 },
  },
  {
    id: "log-5",
    type: "ingestion",
    ts: new Date(Date.now() - 86400000).toISOString(),
    message: "URL alımı: https://docs.example.com/rag-pipeline",
    traceId: "trace-url-aa0",
  },
];
