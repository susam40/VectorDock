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
import { loadPlaygroundPrompts } from "@/lib/playgroundPrompts";
import { saveSelectedLlmModel } from "@/lib/llmSelection";
import Link from "next/link";

const OLLAMA_MODEL_OPTIONS = [
  {
    key: "qwen3-coder-480b",
    label: "Qwen3 Coder 480B",
    model: "qwen/qwen3-coder-480b-a35b-instruct",
  },
  {
    key: "glm4.7",
    label: "GLM 4.7",
    model: "z-ai/glm4.7",
  },
  {
    key: "step-3.5-flash",
    label: "Step 3.5 Flash",
    model: "stepfun-ai/step-3.5-flash",
  },
  {
    key: "gemma-3n-e4b",
    label: "Gemma 3N E4B",
    model: "google/gemma-3n-e4b-it",
  },
] as const;
const DEFAULT_OLLAMA_KEY = OLLAMA_MODEL_OPTIONS[0].key;

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
  const [ollamaModelKey, setOllamaModelKey] = useState<string>(DEFAULT_OLLAMA_KEY);
  const selectedCollectionName =
    collections.find((collection) => collection.id === collectionId)?.name ?? "";
  const selectedModelLabel =
    OLLAMA_MODEL_OPTIONS.find((option) => option.key === ollamaModelKey)?.label ?? "";

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
        <Label>Ollama modeli</Label>
        <Select
          value={ollamaModelKey}
          onValueChange={(value) => {
            if (value) setOllamaModelKey(value);
          }}
        >
          <SelectTrigger className="font-mono text-sm">
            <SelectValue>{selectedModelLabel || "Model sec"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {OLLAMA_MODEL_OPTIONS.map((option) => (
              <SelectItem key={option.key} value={option.key} className="font-mono text-sm">
                {option.label}
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
          const selectedModel =
            OLLAMA_MODEL_OPTIONS.find((option) => option.key === ollamaModelKey)?.model;
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
