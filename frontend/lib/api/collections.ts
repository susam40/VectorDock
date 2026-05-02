import type { Collection } from "@/lib/types";
import { apiFetch, parseJson } from "@/lib/api/client";

export async function fetchCollections(): Promise<Collection[]> {
  const res = await apiFetch("/api/collections");
  return parseJson<Collection[]>(res);
}

export async function fetchCollection(id: string): Promise<Collection | null> {
  const res = await apiFetch(`/api/collections/${id}`);
  if (res.status === 404) return null;
  return parseJson<Collection>(res);
}

export async function updateCollection(
  id: string,
  patch: Partial<Collection>,
): Promise<Collection> {
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
  const res = await apiFetch("/api/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseJson<Collection>(res);
}

export async function deleteCollection(id: string): Promise<void> {
  const res = await apiFetch(`/api/collections/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}
