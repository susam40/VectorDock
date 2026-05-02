"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RetrievedChunk } from "@/lib/types";
import { ChunkScore } from "@/components/playground/ChunkScore";

export function RetrievalResults({ chunks }: { chunks: RetrievedChunk[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gelen parçalar</CardTitle>
        <CardDescription>Skorlar ve kaynak belge</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {chunks.map((c) => (
          <ChunkRow key={c.id} chunk={c} />
        ))}
      </CardContent>
    </Card>
  );
}

function ChunkRow({ chunk }: { chunk: RetrievedChunk }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-border rounded-md border p-3">
      <div className="text-muted-foreground mb-2 text-xs">{chunk.documentName}</div>
      <p className="text-sm">
        {open ? chunk.text : chunk.text.slice(0, 220) + (chunk.text.length > 220 ? "…" : "")}
      </p>
      {chunk.text.length > 220 ? (
        <button
          type="button"
          className="text-primary mt-2 text-xs font-medium"
          onClick={() => setOpen(!open)}
        >
          {open ? "Daha az göster" : "Devamını göster"}
        </button>
      ) : null}
      <div className="mt-3 space-y-2">
        <ChunkScore label="Benzerlik" value={chunk.score} />
        {chunk.rerankScore != null ? (
          <ChunkScore label="Yeniden sıralama" value={chunk.rerankScore} />
        ) : null}
      </div>
    </div>
  );
}
