"use client";

import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ChunkViewer } from "@/components/documents/ChunkViewer";
import { MetadataEditor } from "@/components/documents/MetadataEditor";
import { useChunks, useDocument } from "@/lib/hooks/useDocuments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { docStatusTr, embStatusTr } from "@/lib/tr";

export default function DocumentDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const { data: doc, isLoading } = useDocument(id);
  const { data: chunks, isLoading: cLoading } = useChunks(id);

  return (
    <>
      <Header
        title={doc?.name ?? "Belge"}
        description="Parça görüntüleyici ve üst veri — alım durumunu geri getirme süzgeçleriyle ilişkilendirir."
      />
      <main className="flex-1 space-y-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/documents")}>
          <ArrowLeft className="mr-1 size-4" />
          Geri
        </Button>
        {isLoading || !doc ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="flex flex-wrap gap-2">
            <Badge>{docStatusTr[doc.status]}</Badge>
            <Badge variant="outline">{embStatusTr[doc.embeddingStatus]}</Badge>
            <Badge variant="secondary">{doc.chunkCount} parça</Badge>
          </div>
        )}
        {doc ? <MetadataEditor document={doc} /> : null}
        <div>
          <h2 className="mb-3 text-sm font-semibold">Parçalar</h2>
          {cLoading || !chunks ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <ChunkViewer chunks={chunks} />
          )}
        </div>
      </main>
    </>
  );
}
