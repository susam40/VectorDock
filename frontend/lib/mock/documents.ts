import type { Chunk, Document } from "@/lib/types";
import { getUploadedDocuments } from "@/lib/mock/store";

const base: Document[] = [
  {
    id: "doc-1",
    name: "Q1-Architecture.pdf",
    type: "pdf",
    sizeBytes: 2_048_512,
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    collectionId: "col-1",
    status: "ready",
    chunkCount: 118,
    embeddingStatus: "complete",
    tags: ["architecture", "rag"],
    namespace: "prod",
  },
  {
    id: "doc-2",
    name: "Runbook-Incidents.docx",
    type: "docx",
    sizeBytes: 412_880,
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    collectionId: "col-1",
    status: "ready",
    chunkCount: 42,
    embeddingStatus: "complete",
    tags: ["ops"],
    namespace: "prod",
  },
  {
    id: "doc-3",
    name: "API-Reference.txt",
    type: "txt",
    sizeBytes: 88_432,
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    collectionId: "col-2",
    status: "embedding",
    chunkCount: 19,
    embeddingStatus: "partial",
    tags: ["api"],
  },
  {
    id: "doc-4",
    name: "Security-Review.pdf",
    type: "pdf",
    sizeBytes: 1_200_000,
    uploadedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    collectionId: "col-3",
    status: "ready",
    chunkCount: 76,
    embeddingStatus: "complete",
    tags: ["security"],
  },
  {
    id: "doc-5",
    name: "Product-Roadmap.md",
    type: "txt",
    sizeBytes: 54_100,
    uploadedAt: new Date(Date.now() - 3600000).toISOString(),
    collectionId: "col-2",
    status: "parsing",
    chunkCount: 0,
    embeddingStatus: "pending",
    tags: ["product"],
  },
];

const chunkBodies: Record<string, string[]> = {
  "doc-1": [
    "VectorDock PDF/DOCX/TXT alır, yapılandırılabilir örtüşmeyle parçalar ve vektörleri depoya yazar.",
    "Hibrit geri getirme, kurumsal geri çağırma için sıkı gömüler ile seyrek BM25’i birleştirir.",
    "İzlenebilirlik: alım adımlarını, sorgu izlerini ve hat başına gecikme dağılımını günlükler.",
  ],
  "doc-2": [
    "Olay müdahalesi: sayfa sahibi, geri alma runbook’u ve vektör indeks ısıtma kontrol listesi.",
    "Yeniden sıralayıcı isteğe bağlı — koleksiyon başına aç/kapat; varsayılan çapraz kodlayıcı bütçe 120 ms.",
  ],
  "doc-3": [
    "REST: POST /documents/upload çok parçalı; GET /documents; trace=true ile POST /playground/query.",
  ],
  "doc-4": [
    "Sırlar parça metnine düşmez; gömme öncesi maskeleme katmanı çalışır.",
    "RBAC ad alanlarına bağlanır; geri getirme filtreleri için koleksiyon düzeyinde ACL.",
  ],
};

export function listMockDocuments(): Document[] {
  const extra = getUploadedDocuments();
  return [...extra, ...base];
}

export function getMockDocument(id: string): Document | undefined {
  return listMockDocuments().find((d) => d.id === id);
}

export function getMockChunks(documentId: string): Chunk[] {
  const texts = chunkBodies[documentId] ?? [
    "Bu belge için örnek parça A.",
    "Ad alanı süzgeçleriyle hizalı üst verili örnek parça B.",
  ];
  return texts.map((text, index) => ({
    id: `${documentId}-chunk-${index}`,
    documentId,
    index,
    text,
    embeddingStatus: "complete" as const,
  }));
}
