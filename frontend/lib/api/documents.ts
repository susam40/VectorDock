import type { Chunk, Document } from "@/lib/types";
import { USE_MOCK, apiFetch, delay, parseJson } from "@/lib/api/client";
import {
  getMockChunks,
  getMockDocument,
  listMockDocuments,
} from "@/lib/mock/documents";
import { pushUploadedDocument } from "@/lib/mock/store";

function extToType(name: string): Document["type"] {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  return "txt";
}

export async function fetchDocuments(): Promise<Document[]> {
  if (USE_MOCK) {
    await delay(180);
    return listMockDocuments();
  }
  const res = await apiFetch("/api/documents");
  return parseJson<Document[]>(res);
}

export async function fetchDocument(id: string): Promise<Document | null> {
  if (USE_MOCK) {
    await delay(100);
    return getMockDocument(id) ?? null;
  }
  const res = await apiFetch(`/api/documents/${id}`);
  if (res.status === 404) return null;
  return parseJson<Document>(res);
}

export async function fetchChunks(documentId: string): Promise<Chunk[]> {
  if (USE_MOCK) {
    await delay(120);
    return getMockChunks(documentId);
  }
  const res = await apiFetch(`/api/documents/${documentId}/chunks`);
  return parseJson<Chunk[]>(res);
}

export async function uploadDocumentMock(
  file: File,
  collectionId: string,
): Promise<Document> {
  const id = `doc-up-${Date.now()}`;
  const doc: Document = {
    id,
    name: file.name,
    type: extToType(file.name),
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
    collectionId,
    status: "embedding",
    chunkCount: Math.max(3, Math.floor(file.size / 8000)),
    embeddingStatus: "partial",
    tags: [],
  };
  pushUploadedDocument(doc);
  await delay(400);
  return doc;
}

export async function uploadDocument(
  file: File,
  collectionId: string,
): Promise<Document> {
  if (USE_MOCK) {
    return uploadDocumentMock(file, collectionId);
  }
  const fd = new FormData();
  fd.append("file", file);
  fd.append("collection_id", collectionId);
  const res = await apiFetch("/api/documents/upload", {
    method: "POST",
    body: fd,
  });
  return parseJson<Document>(res);
}

export async function ingestUrlMock(
  url: string,
  collectionId: string,
): Promise<Document> {
  const id = `doc-url-${Date.now()}`;
  const doc: Document = {
    id,
    name: new URL(url).hostname + url.slice(-24),
    type: "txt",
    sizeBytes: 120_000,
    uploadedAt: new Date().toISOString(),
    collectionId,
    status: "parsing",
    chunkCount: 0,
    embeddingStatus: "pending",
    tags: ["url"],
  };
  pushUploadedDocument(doc);
  await delay(500);
  return doc;
}

export async function ingestUrl(url: string, collectionId: string) {
  if (USE_MOCK) {
    return ingestUrlMock(url, collectionId);
  }
  const res = await apiFetch("/api/documents/ingest-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, collection_id: collectionId }),
  });
  return parseJson<Document>(res);
}

export async function deleteDocument(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    const { removeUploadedDocument } = await import("@/lib/mock/store");
    removeUploadedDocument(id);
    return;
  }
  const res = await apiFetch(`/api/documents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

export async function reindexDocument(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(250);
    return;
  }
  const res = await apiFetch(`/api/documents/${id}/reindex`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(await res.text());
}
