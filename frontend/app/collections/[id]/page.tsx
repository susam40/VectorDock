"use client";

import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ConfigPanel } from "@/components/collections/ConfigPanel";
import {
  useCollection,
  useDeleteCollection,
  useUpdateCollection,
} from "@/lib/hooks/useCollections";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function CollectionDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const { data: col, isLoading } = useCollection(id);
  const update = useUpdateCollection(id);
  const del = useDeleteCollection();

  return (
    <>
      <Header
        title={col?.name ?? "Koleksiyon"}
        description="Bilgi alanı başına parçalama, hibrit geri getirme ve yeniden sıralamayı ayarlayın."
      />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/collections")}>
            <ArrowLeft className="mr-1 size-4" />
            Geri
          </Button>
          {col ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                void del.mutateAsync(col.id).then(() => {
                  toast.success("Koleksiyon kaldırıldı");
                  router.push("/collections");
                });
              }}
            >
              Koleksiyonu sil
            </Button>
          ) : null}
        </div>
        {isLoading || !col ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <ConfigPanel
            collection={col}
            disabled={update.isPending}
            onSave={(patch) => {
              void update.mutateAsync(patch).then(() => toast.success("Kaydedildi"));
            }}
          />
        )}
      </main>
    </>
  );
}
