import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCollection,
  deleteCollection,
  fetchCollection,
  fetchCollections,
  updateCollection,
} from "@/lib/api/collections";
import type { Collection } from "@/lib/types";

export const ck = {
  list: ["collections"] as const,
  one: (id: string) => ["collections", id] as const,
};

export function useCollections() {
  return useQuery({ queryKey: ck.list, queryFn: fetchCollections });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: ck.one(id),
    queryFn: () => fetchCollection(id),
    enabled: Boolean(id),
  });
}

export function useUpdateCollection(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Collection>) => updateCollection(id, patch),
    onSuccess: (data) => {
      qc.setQueryData(ck.one(id), data);
      qc.invalidateQueries({ queryKey: ck.list });
    },
  });
}

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ck.list }),
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCollection(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ck.list }),
  });
}
