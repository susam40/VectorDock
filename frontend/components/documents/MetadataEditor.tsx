"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Document } from "@/lib/types";
import { toast } from "sonner";

export function MetadataEditor({
  document,
  onSave,
}: {
  document: Document;
  onSave?: (patch: Partial<Pick<Document, "tags" | "namespace">>) => void;
}) {
  const [namespace, setNamespace] = useState(document.namespace ?? "");
  const [tagInput, setTagInput] = useState(document.tags.join(", "));

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <Label htmlFor="ns">Ad alanı (namespace)</Label>
        <Input
          id="ns"
          value={namespace}
          onChange={(e) => setNamespace(e.target.value)}
          placeholder="örn. prod"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Etiketler (virgülle ayırın)</Label>
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="rag, dahili"
        />
      </div>
      <Button
        type="button"
        onClick={() => {
          const tags = tagInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
          onSave?.({
            namespace: namespace || undefined,
            tags,
          });
          toast.success("Üst veri kaydedildi (örnek)");
        }}
      >
        Üst veriyi kaydet
      </Button>
    </div>
  );
}
