"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Collection, PlaygroundQueryInput } from "@/lib/types";

export function QueryInput({
  collections,
  defaultCollectionId,
  onSubmit,
  loading,
}: {
  collections: Collection[];
  defaultCollectionId?: string;
  onSubmit: (input: PlaygroundQueryInput) => void;
  loading?: boolean;
}) {
  const [query, setQuery] = useState(
    "VectorDock’ta hibrit geri getirme nasıl çalışır?",
  );
  const [collectionId, setCollectionId] = useState(
    defaultCollectionId ?? collections[0]?.id ?? "",
  );
  const [searchType, setSearchType] =
    useState<PlaygroundQueryInput["searchType"]>("hybrid");
  const [topK, setTopK] = useState(8);
  const [threshold, setThreshold] = useState(0.72);

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <Label>Sorgu</Label>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Belgeleriniz hakkında soru yazın…"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Koleksiyon</Label>
          <Select
            value={collectionId}
            onValueChange={(v) => {
              if (v) setCollectionId(v);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Koleksiyon" />
            </SelectTrigger>
            <SelectContent>
              {collections.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Arama türü</Label>
          <Tabs
            value={searchType}
            onValueChange={(v) =>
              setSearchType(v as PlaygroundQueryInput["searchType"])
            }
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="semantic">Anlamsal</TabsTrigger>
              <TabsTrigger value="hybrid">Hibrit</TabsTrigger>
              <TabsTrigger value="bm25">BM25</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Üst-k (top-k)</span>
            <span className="font-mono">{topK}</span>
          </div>
          <Slider
            value={[topK]}
            min={1}
            max={20}
            step={1}
            onValueChange={(v) =>
              setTopK(Array.isArray(v) ? (v[0] ?? topK) : v)
            }
          />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Benzerlik eşiği</span>
            <span className="font-mono">{threshold.toFixed(2)}</span>
          </div>
          <Slider
            value={[threshold]}
            min={0.5}
            max={0.95}
            step={0.01}
            onValueChange={(v) =>
              setThreshold(Array.isArray(v) ? (v[0] ?? threshold) : v)
            }
          />
        </div>
      </div>
      <Button
        type="button"
        disabled={loading || !query.trim() || !collectionId}
        onClick={() =>
          onSubmit({
            query: query.trim(),
            collectionId,
            searchType,
            topK,
            threshold,
          })
        }
      >
        {loading ? "İşleniyor…" : "Geri getir + LLM çalıştır"}
      </Button>
    </div>
  );
}
