import type { Collection } from "@/lib/types";
import { USE_MOCK, apiFetch, delay, parseJson } from "@/lib/api/client";
import { MOCK_COLLECTIONS } from "@/lib/mock/collections";

export async function fetchCollections(): Promise<Collection[]> {
  if (USE_MOCK) {
    await delay(150);
    return MOCK_COLLECTIONS;
  }
  const res = await apiFetch("/api/collections");
  return parseJson<Collection[]>(res);
}

export async function fetchCollection(id: string): Promise<Collection | null> {
  if (USE_MOCK) {
    await delay(100);
    return MOCK_COLLECTIONS.find((c) => c.id === id) ?? null;
  }
  const res = await apiFetch(`/api/collections/${id}`);
  if (res.status === 404) return null;
  return parseJson<Collection>(res);
}

export async function updateCollection(
  id: string,
  patch: Partial<Collection>,
): Promise<Collection> {
  if (USE_MOCK) {
    await delay(200);
    const cur =
      MOCK_COLLECTIONS.find((c) => c.id === id) ?? MOCK_COLLECTIONS[0];
    return { ...cur, ...patch, id: cur.id };
  }
  const res = await apiFetch(`/api/collections/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parseJson<Collection>(res);
}

export async function createCollection(
  data: Pick<Collection, "name" | "description"> &
    Partial<Omit<Collection, "id" | "name" | "description" | "createdAt">>,
): Promise<Collection> {
  if (USE_MOCK) {
    await delay(200);
    const c: Collection = {
      id: `col-${Date.now()}`,
      name: data.name,
      description: data.description,
      documentCount: 0,
      embeddingModel: data.embeddingModel ?? "text-embedding-3-small",
      chunkSize: data.chunkSize ?? 768,
      overlap: data.overlap ?? 96,
      chunkingStrategy: data.chunkingStrategy ?? "fixed",
      topK: data.topK ?? 8,
      threshold: data.threshold ?? 0.7,
      hybridSearch: data.hybridSearch ?? false,
      reranker: data.reranker ?? false,
      createdAt: new Date().toISOString(),
    };
    MOCK_COLLECTIONS.push(c);
    return c;
  }
  const res = await apiFetch("/api/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJson<Collection>(res);
}

export async function deleteCollection(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(200);
    const idx = MOCK_COLLECTIONS.findIndex((c) => c.id === id);
    if (idx >= 0) MOCK_COLLECTIONS.splice(idx, 1);
    return;
  }
  const res = await apiFetch(`/api/collections/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}
