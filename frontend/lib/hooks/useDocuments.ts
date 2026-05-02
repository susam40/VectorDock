import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteDocument,
  fetchChunks,
  fetchDocument,
  fetchDocuments,
  ingestUrl,
  reindexDocument,
  uploadDocument,
} from "@/lib/api/documents";

export const qk = {
  documents: ["documents"] as const,
  document: (id: string) => ["documents", id] as const,
  chunks: (id: string) => ["documents", id, "chunks"] as const,
};

export function useDocuments() {
  return useQuery({ queryKey: qk.documents, queryFn: fetchDocuments });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: qk.document(id),
    queryFn: () => fetchDocument(id),
    enabled: Boolean(id),
  });
}

export function useChunks(documentId: string) {
  return useQuery({
    queryKey: qk.chunks(documentId),
    queryFn: () => fetchChunks(documentId),
    enabled: Boolean(documentId),
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, collectionId }: { file: File; collectionId: string }) =>
      uploadDocument(file, collectionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.documents }),
  });
}

export function useIngestUrl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ url, collectionId }: { url: string; collectionId: string }) =>
      ingestUrl(url, collectionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.documents }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.documents });
      await qc.refetchQueries({ queryKey: qk.documents });
    },
  });
}

export function useReindexDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reindexDocument(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: qk.document(id) });
      qc.invalidateQueries({ queryKey: qk.documents });
    },
  });
}
