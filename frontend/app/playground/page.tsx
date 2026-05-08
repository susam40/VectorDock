"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Header } from "@/components/layout/Header";
import { QueryInput } from "@/components/playground/QueryInput";
import { PipelineVisualizer } from "@/components/playground/PipelineVisualizer";
import { RetrievalResults } from "@/components/playground/RetrievalResults";
import { LatencyBreakdown } from "@/components/playground/LatencyBreakdown";
import { useCollections } from "@/lib/hooks/useCollections";
import { useOllamaModels, usePlaygroundQuery } from "@/lib/hooks/usePlayground";
import type { PlaygroundResponse } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlaygroundPage() {
  const { data: collections } = useCollections();
  const models = useOllamaModels();
  const run = usePlaygroundQuery();
  const [result, setResult] = useState<PlaygroundResponse | null>(null);

  return (
    <>
      <Header
        title="Sorgu laboratuvarı"
        description="Uçtan uca RAG hattını çalıştırın ve her adımın çıktısını inceleyin."
      />
      <main className="flex-1 space-y-6 p-6">
        {collections?.length && models.data?.models?.length ? (
          <QueryInput
            collections={collections}
            ollamaModels={models.data.models}
            onSubmit={async (input) => {
              setResult(null);
              try {
                const r = await run.mutateAsync(input);
                setResult(r);
              } catch {
                /* usePlaygroundQuery error state */
              }
            }}
            loading={run.isPending}
          />
        ) : (
          <Skeleton className="h-64 w-full" />
        )}

        {models.isError ? (
          <p className="text-destructive text-sm">
            {models.error instanceof Error ? models.error.message : "Model listesi alinamadi"}
          </p>
        ) : null}

        {run.isError ? (
          <p className="text-destructive text-sm">
            {run.error instanceof Error ? run.error.message : "İstek başarısız"}
          </p>
        ) : null}

        {run.isPending ? (
          <Skeleton className="h-[480px] w-full" />
        ) : result ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <PipelineVisualizer steps={result.pipeline} />
            <LatencyBreakdown data={result.latencyBreakdown} />
            <div className="xl:col-span-2">
              <RetrievalResults chunks={result.chunks} />
            </div>
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">LLM yanıtı</CardTitle>
                <CardDescription>
                  Model: <span className="font-mono">{result.llmModel}</span> — jetonlar girdi/çıktı:{" "}
                  {result.tokens.input} / {result.tokens.output} (toplam {result.tokens.total})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{result.answer}</p>
                <Tabs defaultValue="final">
                  <TabsList>
                    <TabsTrigger value="raw">Ham sorgu</TabsTrigger>
                    <TabsTrigger value="rewritten">Yeniden yazılmış</TabsTrigger>
                    <TabsTrigger value="final">Son istem</TabsTrigger>
                  </TabsList>
                  <TabsContent value="raw">
                    <pre className="bg-muted/50 overflow-x-auto rounded-md p-3 text-sm">
                      {result.rawQuery}
                    </pre>
                  </TabsContent>
                  <TabsContent value="rewritten">
                    <pre className="bg-muted/50 overflow-x-auto rounded-md p-3 text-sm">
                      {result.rewrittenQuery}
                    </pre>
                  </TabsContent>
                  <TabsContent value="final" className="mt-3">
                    <SyntaxHighlighter
                      language="markdown"
                      style={oneDark}
                      customStyle={{
                        borderRadius: 8,
                        fontSize: 13,
                        margin: 0,
                      }}
                    >
                      {result.finalPrompt}
                    </SyntaxHighlighter>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Hat adımlarını, parçaları ve LLM çıktısını görmek için bir sorgu çalıştırın.
          </p>
        )}
      </main>
    </>
  );
}
