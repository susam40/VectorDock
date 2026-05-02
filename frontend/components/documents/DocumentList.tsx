"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentCard } from "@/components/documents/DocumentCard";
import type { Document } from "@/lib/types";

export function DocumentList({
  documents,
  onDelete,
  onReindex,
}: {
  documents: Document[];
  onDelete?: (id: string) => void | Promise<void>;
  onReindex?: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return documents;
    return documents.filter(
      (d) =>
        d.name.toLowerCase().includes(s) ||
        d.tags.some((t) => t.toLowerCase().includes(s)),
    );
  }, [documents, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Belgelerde ara…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-md"
        />
        <Tabs
          value={layout}
          onValueChange={(v) => setLayout(v as "grid" | "list")}
        >
          <TabsList>
            <TabsTrigger value="grid">Izgara</TabsTrigger>
            <TabsTrigger value="list">Liste</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div
        className={
          layout === "grid"
            ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            : "flex flex-col gap-3"
        }
      >
        {filtered.map((doc) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            onDelete={onDelete}
            onReindex={onReindex}
          />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">Eşleşen belge yok.</p>
      ) : null}
    </div>
  );
}
