import type { ActivityPoint, StatsOverview } from "@/lib/types";
import { listMockDocuments } from "@/lib/mock/documents";
import { MOCK_COLLECTIONS } from "@/lib/mock/collections";

export function getMockStats(): StatsOverview {
  const docs = listMockDocuments();
  const chunks = docs.reduce((s, d) => s + d.chunkCount, 0);
  return {
    totalDocuments: docs.length,
    indexedChunks: chunks,
    activeCollections: MOCK_COLLECTIONS.length,
    embeddingModel: "text-embedding-3-large",
    llmProvider: "gpt-4.1-mini",
    avgQueryLatencyMs: 840,
    storageUsageBytes: 2_400_000_000 + docs.length * 50_000,
    queueDepth: 2,
    activeJobs: 3,
    health: {
      embedding: "healthy",
      llm: "healthy",
      vectorDb: "degraded",
    },
  };
}

export function getMockActivity(): ActivityPoint[] {
  const days = 7;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().slice(0, 10),
      queries: 120 + i * 18 + ((i * 7) % 23),
      uploads: 4 + (i % 4),
      errors: i === 3 ? 2 : 0,
    };
  });
}
