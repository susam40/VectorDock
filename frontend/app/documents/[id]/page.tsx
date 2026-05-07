"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ChunkViewer } from "@/components/documents/ChunkViewer";
import { MetadataEditor } from "@/components/documents/MetadataEditor";
import { useChunks, useDocument } from "@/lib/hooks/useDocuments";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Eye } from "lucide-react";
import { docStatusTr, embStatusTr } from "@/lib/tr";
import { API_BASE } from "@/lib/api/client";

export default function DocumentDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const { data: doc, isLoading } = useDocument(id);
  const { data: chunks, isLoading: cLoading } = useChunks(id);
  const fileUrl = `${API_BASE}/api/documents/${id}/file`;
  const downloadUrl = `${fileUrl}?download=1`;
  const [previewOpen, setPreviewOpen] = useState(false);

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
        {doc?.type === "pdf" ? (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Orijinal PDF</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                  <Eye className="mr-1 size-3.5" />
                  Onizle
                </Button>
                <a
                  href={downloadUrl}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <Download className="mr-1 inline size-3.5" />
                  Indir
                </a>
              </div>
            </div>
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogContent
                className="h-[92vh] w-[96vw] max-w-[96vw] overflow-hidden p-0 sm:max-w-[96vw]"
                showCloseButton={false}
              >
                <iframe
                  src={fileUrl}
                  title={doc.name}
                  className="block h-full w-full border-0"
                />
              </DialogContent>
            </Dialog>
          </div>
        ) : null}
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
