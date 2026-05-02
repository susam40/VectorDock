export type DocStatus = "pending" | "parsing" | "embedding" | "ready" | "failed";

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "docx" | "txt";
  sizeBytes: number;
  uploadedAt: string;
  collectionId: string;
  status: DocStatus;
  chunkCount: number;
  embeddingStatus: "pending" | "partial" | "complete";
  tags: string[];
  namespace?: string;
}

export interface Chunk {
  id: string;
  documentId: string;
  index: number;
  text: string;
  embeddingStatus: "complete" | "pending";
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  embeddingModel: string;
  chunkSize: number;
  overlap: number;
  chunkingStrategy: "fixed" | "semantic";
  topK: number;
  threshold: number;
  hybridSearch: boolean;
  reranker: boolean;
  createdAt: string;
}

export interface StatsOverview {
  totalDocuments: number;
  indexedChunks: number;
  activeCollections: number;
  embeddingModel: string;
  llmProvider: string;
  avgQueryLatencyMs: number;
  storageUsageBytes: number;
  queueDepth: number;
  activeJobs: number;
  health: {
    embedding: "healthy" | "degraded" | "down";
    llm: "healthy" | "degraded" | "down";
    vectorDb: "healthy" | "degraded" | "down";
  };
}

export interface ActivityPoint {
  date: string;
  queries: number;
  uploads: number;
  errors: number;
}

export interface PlaygroundQueryInput {
  query: string;
  collectionId: string;
  searchType: "semantic" | "hybrid" | "bm25";
  topK: number;
  threshold: number;
  ollamaModel?: string;
}

export interface PipelineStep {
  id: string;
  name: string;
  status: "success" | "skipped" | "error";
  latencyMs: number;
  input?: string;
  output?: string;
}

export interface RetrievedChunk {
  id: string;
  text: string;
  score: number;
  rerankScore?: number;
  documentName: string;
}

export interface PlaygroundResponse {
  rawQuery: string;
  rewrittenQuery: string;
  pipeline: PipelineStep[];
  chunks: RetrievedChunk[];
  finalPrompt: string;
  llmModel: string;
  answer: string;
  tokens: { input: number; output: number; total: number };
  latencyBreakdown: {
    embedding: number;
    retrieval: number;
    reranking: number;
    llm: number;
    total: number;
  };
}

export type LogType = "ingestion" | "query" | "error" | "system";

export interface LogEntry {
  id: string;
  type: LogType;
  ts: string;
  message: string;
  payload?: Record<string, unknown>;
  traceId?: string;
}
