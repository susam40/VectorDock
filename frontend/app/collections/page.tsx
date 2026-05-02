"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { useCollections, useCreateCollection } from "@/lib/hooks/useCollections";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function CollectionsPage() {
  const { data, isLoading } = useCollections();
  const create = useCreateCollection();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  return (
    <>
      <Header
        title="Koleksiyonlar"
        description="Parçalama stratejisi, gömme modelleri ve arama parametreleri için ad alanları."
      />
      <main className="flex-1 space-y-6 p-6">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <Button type="button" onClick={() => setOpen(true)}>
              Yeni koleksiyon
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Koleksiyon oluştur</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-2">
                  <Label>Ad</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Açıklama</Label>
                  <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
                </div>
                <Button
                  disabled={!name.trim() || create.isPending}
                  onClick={() => {
                    void create
                      .mutateAsync({ name: name.trim(), description: desc })
                      .then(() => {
                        toast.success("Koleksiyon oluşturuldu");
                        setOpen(false);
                        setName("");
                        setDesc("");
                      });
                  }}
                >
                  Oluştur
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading || !data ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((c) => (
              <CollectionCard key={c.id} collection={c} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
