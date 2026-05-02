"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Collection } from "@/lib/types";

export type CollectionFormValues = {
  name: string;
  description?: string;
  embeddingModel: string;
  chunkSize: number;
  overlap: number;
  chunkingStrategy: "fixed" | "semantic";
  topK: number;
  threshold: number;
  hybridSearch: boolean;
  reranker: boolean;
};

export function ConfigPanel({
  collection,
  onSave,
  disabled,
}: {
  collection: Collection;
  onSave: (patch: Partial<Collection>) => void;
  disabled?: boolean;
}) {
  const form = useForm<CollectionFormValues>({
    defaultValues: {
      name: collection.name,
      description: collection.description ?? "",
      embeddingModel: collection.embeddingModel,
      chunkSize: collection.chunkSize,
      overlap: collection.overlap,
      chunkingStrategy: collection.chunkingStrategy,
      topK: collection.topK,
      threshold: collection.threshold,
      hybridSearch: collection.hybridSearch,
      reranker: collection.reranker,
    },
  });

  useEffect(() => {
    form.reset({
      name: collection.name,
      description: collection.description ?? "",
      embeddingModel: collection.embeddingModel,
      chunkSize: collection.chunkSize,
      overlap: collection.overlap,
      chunkingStrategy: collection.chunkingStrategy,
      topK: collection.topK,
      threshold: collection.threshold,
      hybridSearch: collection.hybridSearch,
      reranker: collection.reranker,
    });
  }, [collection, form]);

  return (
    <form
      className="space-y-6 rounded-lg border p-4"
      onSubmit={form.handleSubmit((v) => onSave(v))}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Ad</Label>
          <Input {...form.register("name")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Açıklama</Label>
          <Input {...form.register("description")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Gömme modeli</Label>
          <Select
            value={form.watch("embeddingModel")}
            onValueChange={(v) => {
              if (v) form.setValue("embeddingModel", v);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text-embedding-3-small">
                text-embedding-3-small
              </SelectItem>
              <SelectItem value="text-embedding-3-large">
                text-embedding-3-large
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Parçalama stratejisi</Label>
          <Select
            value={form.watch("chunkingStrategy")}
            onValueChange={(v) => {
              if (v)
                form.setValue("chunkingStrategy", v as "fixed" | "semantic");
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Sabit</SelectItem>
              <SelectItem value="semantic">Anlamsal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Parça boyutu</Label>
          <Input
            type="number"
            {...form.register("chunkSize", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Örtüşme</Label>
          <Input
            type="number"
            {...form.register("overlap", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Üst-k (top-k)</Label>
          <Input
            type="number"
            {...form.register("topK", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Benzerlik eşiği</Label>
          <Input
            type="number"
            step="0.01"
            {...form.register("threshold", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-8">
        <div className="flex items-center gap-2">
          <Switch
            checked={form.watch("hybridSearch")}
            onCheckedChange={(c) => form.setValue("hybridSearch", c)}
            id="hybrid"
          />
          <Label htmlFor="hybrid">Hibrit arama</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={form.watch("reranker")}
            onCheckedChange={(c) => form.setValue("reranker", c)}
            id="rerank"
          />
          <Label htmlFor="rerank">Yeniden sıralayıcı</Label>
        </div>
      </div>

      <Button type="submit" disabled={disabled}>
        Değişiklikleri kaydet
      </Button>
    </form>
  );
}
