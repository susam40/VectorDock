"use client";

import { Header } from "@/components/layout/Header";
import { UploadZone } from "@/components/documents/UploadZone";
import { DocumentList } from "@/components/documents/DocumentList";
import {
  useDeleteDocument,
  useDocuments,
  useIngestUrl,
  useReindexDocument,
  useUploadDocument,
} from "@/lib/hooks/useDocuments";
import { useCollections } from "@/lib/hooks/useCollections";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function DocumentsPage() {
  const { data: docs, isLoading } = useDocuments();
  const { data: collections, isLoading: collectionsLoading } = useCollections();
  const upload = useUploadDocument();
  const ingestUrl = useIngestUrl();
  const del = useDeleteDocument();
  const reindex = useReindexDocument();

  return (
    <>
      <Header
        title="Belge yönetimi"
        description="Alım, ayrıştırma, parçalama ve gömme — bilgi tabanınızın operasyonel görünümü."
      />
      <main className="flex-1 space-y-8 p-6">
        {collectionsLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <UploadZone
            collections={collections ?? []}
            onUploadFiles={async (files, collectionId) => {
              for (const f of files) {
                await upload.mutateAsync({ file: f, collectionId });
              }
            }}
            onIngestUrl={async (url, collectionId) => {
              await ingestUrl.mutateAsync({ url, collectionId });
            }}
            disabled={upload.isPending || ingestUrl.isPending}
          />
        )}
        {isLoading || !docs ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <DocumentList
            documents={docs}
            onDelete={async (id) => {
              try {
                await del.mutateAsync(id);
                toast.success("Belge silindi");
              } catch {
                toast.error("Belge silinemedi");
              }
            }}
            onReindex={(id) => {
              void reindex.mutateAsync(id).then(() =>
                toast.success("Yeniden indeksleme kuyruğa alındı"),
              );
            }}
          />
        )}
      </main>
    </>
  );
}
