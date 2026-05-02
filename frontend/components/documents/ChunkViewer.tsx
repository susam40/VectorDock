"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chunk } from "@/lib/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { embStatusTr } from "@/lib/tr";

export function ChunkViewer({ chunks }: { chunks: Chunk[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <ScrollArea className="h-[480px] rounded-md border">
      <div className="divide-y">
        {chunks.map((c) => {
          const expanded = open[c.id] ?? false;
          return (
            <div key={c.id} className="p-3">
              <div className="flex items-start gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() =>
                    setOpen((s) => ({ ...s, [c.id]: !expanded }))
                  }
                >
                  {expanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </Button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs">#{c.index}</span>
                    <Badge variant="outline">
                      {embStatusTr[c.embeddingStatus]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {expanded ? c.text : c.text.slice(0, 160) + (c.text.length > 160 ? "…" : "")}
                  </p>
                  {c.text.length > 160 ? (
                    <button
                      type="button"
                      className="text-primary mt-2 text-xs font-medium"
                      onClick={() =>
                        setOpen((s) => ({ ...s, [c.id]: !expanded }))
                      }
                    >
                      {expanded ? "Daha az göster" : "Devamını göster"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
