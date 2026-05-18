"use client";

import { useEffect, useState } from "react";
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
import { loadPlaygroundPrompts } from "@/lib/playgroundPrompts";
import { saveSelectedLlmModel } from "@/lib/llmSelection";
import Link from "next/link";

export function QueryInput({
  collections,
  ollamaModels,
  defaultCollectionId,
  onSubmit,
  loading,
}: {
  collections: Collection[];
  ollamaModels: string[];
  defaultCollectionId?: string;
  onSubmit: (input: PlaygroundQueryInput) => void;
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [collectionId, setCollectionId] = useState(
    defaultCollectionId ?? collections[0]?.id ?? "",
  );
  const [searchType, setSearchType] =
    useState<PlaygroundQueryInput["searchType"]>("hybrid");
  const [topK, setTopK] = useState(8);
  const [threshold, setThreshold] = useState(0.72);
  const [ollamaModel, setOllamaModel] = useState<string>(ollamaModels[0] ?? "");
  const selectedCollectionName =
    collections.find((collection) => collection.id === collectionId)?.name ?? "";
  const selectedModelName = ollamaModels.includes(ollamaModel)
    ? ollamaModel
    : (ollamaModels[0] ?? "");

  useEffect(() => {
    if (!ollamaModels.length) return;
    if (!ollamaModel || !ollamaModels.includes(ollamaModel)) {
      setOllamaModel(ollamaModels[0]);
    }
  }, [ollamaModel, ollamaModels]);

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <p className="text-muted-foreground text-sm">
        RAG istem şablonları{" "}
        <Link href="/prompts" className="text-primary font-medium underline-offset-4 hover:underline">
          İstemler
        </Link>{" "}
        sayfasından düzenlenir.
      </p>
      <div className="space-y-2">
        <Label>Sorgu</Label>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Belgeleriniz hakkında soru yazın…"
        />
      </div>
      <div className="space-y-2">
        <Label>Yapay Zeka Modeli</Label>
        <Select
          value={selectedModelName}
          onValueChange={(value) => {
            if (value) setOllamaModel(value);
          }}
        >
          <SelectTrigger className="h-auto min-h-8 w-full max-w-full font-mono text-sm whitespace-normal *:data-[slot=select-value]:line-clamp-none *:data-[slot=select-value]:whitespace-normal *:data-[slot=select-value]:break-all">
            <SelectValue>{selectedModelName || "Model seç"}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-w-[min(100vw-2rem,42rem)]">
            {ollamaModels.map((modelName) => (
              <SelectItem
                key={modelName}
                value={modelName}
                className="font-mono text-sm whitespace-normal break-all"
              >
                {modelName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <SelectValue>{selectedCollectionName || "Koleksiyon"}</SelectValue>
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
        onClick={() => {
          const p = loadPlaygroundPrompts();
          const selectedModel = selectedModelName || undefined;
          if (selectedModel) saveSelectedLlmModel(selectedModel);
          onSubmit({
            query: query.trim(),
            collectionId,
            searchType,
            topK,
            threshold,
            ollamaModel: selectedModel,
            systemPrompt: p.systemPrompt.trim() || undefined,
            userPromptWithContext:
              p.userPromptWithContext.trim() || undefined,
            userPromptNoContext:
              p.userPromptNoContext.trim() || undefined,
          });
        }}
      >
        {loading ? "İşleniyor…" : "Geri getir + LLM çalıştır"}
      </Button>
    </div>
  );
}
