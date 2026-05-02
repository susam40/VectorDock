import type { Chunk, Document } from "@/lib/types";
import { apiFetch, parseJson } from "@/lib/api/client";

export async function fetchDocuments(): Promise<Document[]> {
  const res = await apiFetch("/api/documents");
  return parseJson<Document[]>(res);
}

export async function fetchDocument(id: string): Promise<Document | null> {
  const res = await apiFetch(`/api/documents/${id}`);
  if (res.status === 404) return null;
  return parseJson<Document>(res);
}

export async function fetchChunks(documentId: string): Promise<Chunk[]> {
  const res = await apiFetch(`/api/documents/${documentId}/chunks`);
  return parseJson<Chunk[]>(res);
}

export async function uploadDocument(
  file: File,
  collectionId: string,
): Promise<Document> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("collection_id", collectionId);
  const res = await apiFetch("/api/documents/upload", {
    method: "POST",
    body: fd,
  });
  return parseJson<Document>(res);
}

export async function ingestUrl(url: string, collectionId: string) {
  const res = await apiFetch("/api/documents/ingest-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, collection_id: collectionId }),
  });
  return parseJson<Document>(res);
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await apiFetch(`/api/documents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

export async function reindexDocument(id: string): Promise<void> {
  const res = await apiFetch(`/api/documents/${id}/reindex`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(await res.text());
}
