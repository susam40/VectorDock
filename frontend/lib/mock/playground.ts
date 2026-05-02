import type { PlaygroundQueryInput, PlaygroundResponse } from "@/lib/types";
import { getMockDocument } from "@/lib/mock/documents";

export function buildMockPlaygroundResponse(
  input: PlaygroundQueryInput,
): PlaygroundResponse {
  const rewritten = `${input.query.trim()} (genişletildi: vektör araması, hibrit=${input.searchType})`;
  const doc = getMockDocument("doc-1");
  const chunks = [
    {
      id: "c-1",
      text: "Hibrit geri getirme, kurumsal geri çağırma için sıkı gömüler ile seyrek BM25’i birleştirir.",
      score: 0.91,
      rerankScore: input.searchType !== "bm25" ? 0.88 : undefined,
      documentName: doc?.name ?? "Q1-Architecture.pdf",
    },
    {
      id: "c-2",
      text: "İzlenebilirlik: alım adımlarını, sorgu izlerini ve hat başına gecikme dağılımını günlükler.",
      score: 0.84,
      rerankScore: input.searchType !== "bm25" ? 0.79 : undefined,
      documentName: doc?.name ?? "Q1-Architecture.pdf",
    },
    {
      id: "c-3",
      text: "VectorDock PDF/DOCX/TXT alır, yapılandırılabilir örtüşmeyle parçalar ve vektörleri depoya yazar.",
      score: 0.78,
      rerankScore: input.searchType !== "bm25" ? 0.74 : undefined,
      documentName: doc?.name ?? "Q1-Architecture.pdf",
    },
  ].slice(0, Math.min(input.topK, 3));

  const embedding = 42;
  const retrieval = input.searchType === "hybrid" ? 128 : 96;
  const reranking = input.searchType === "bm25" || !input.searchType ? 0 : 118;
  const llm = 512;
  const total = embedding + retrieval + reranking + llm;

  const finalPrompt = `Sistem: VectorDock asistanısın. Yalnızca BAĞLAM kullan.\nKullanıcı: ${input.query}\nBağlam:\n${chunks.map((c) => `- ${c.text}`).join("\n")}`;

  return {
    rawQuery: input.query,
    rewrittenQuery: rewritten,
    pipeline: [
      {
        id: "rewrite",
        name: "Sorgu yeniden yazma",
        status: "success",
        latencyMs: 18,
        input: input.query,
        output: rewritten,
      },
      {
        id: "embed",
        name: "Gömme",
        status: "success",
        latencyMs: embedding,
        input: rewritten,
        output: "[vektör boyut 3072]",
      },
      {
        id: "retrieve",
        name:
          input.searchType === "semantic"
            ? "Vektör araması"
            : input.searchType === "hybrid"
              ? "Hibrit (sıkı + BM25)"
              : "BM25",
        status: "success",
        latencyMs: retrieval,
        output: `${chunks.length} parça ≥ ${input.threshold}`,
      },
      {
        id: "rerank",
        name: "Yeniden sıralayıcı",
        status: input.searchType === "bm25" ? "skipped" : "success",
        latencyMs: reranking,
        output:
          input.searchType === "bm25"
            ? undefined
            : "çapraz kodlayıcı ile üst-k yeniden sıra",
      },
      {
        id: "prompt",
        name: "İstem oluşturma",
        status: "success",
        latencyMs: 12,
        output: `${finalPrompt.length} karakter`,
      },
      {
        id: "llm",
        name: "LLM",
        status: "success",
        latencyMs: llm,
        output: "tamamlama",
      },
    ],
    chunks,
    finalPrompt,
    answer: `Geri getirilen bağlama göre VectorDock, yapılandırılabilir top-k=${input.topK} ve eşik=${input.threshold} ile ${input.searchType} geri getirmeyi destekler. Özet: hibrit sıkı+seyrek geri çağırmayı iyileştirir; hat aşamaları gecikme izlenebilirliği için izlenir.`,
    tokens: { input: 420, output: 180, total: 600 },
    latencyBreakdown: {
      embedding,
      retrieval,
      reranking,
      llm,
      total,
    },
  };
}
