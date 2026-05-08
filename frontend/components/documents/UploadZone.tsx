"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Collection } from "@/lib/types";

const ACCEPT = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
};

export function UploadZone({
  collections,
  defaultCollectionId,
  onUploadFiles,
  onIngestUrl,
  disabled,
}: {
  collections: Collection[];
  defaultCollectionId?: string;
  onUploadFiles: (files: File[], collectionId: string) => Promise<void>;
  onIngestUrl: (url: string, collectionId: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [collectionId, setCollectionId] = useState(
    defaultCollectionId ?? collections[0]?.id ?? "",
  );
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (defaultCollectionId) {
      setCollectionId(defaultCollectionId);
      return;
    }
    if (!collectionId && collections[0]?.id) {
      setCollectionId(collections[0].id);
    }
  }, [collections, defaultCollectionId, collectionId]);

  const noCollection = collections.length === 0;
  const selectedCollectionName =
    collections.find((collection) => collection.id === collectionId)?.name ?? "";

  const submitFiles = async (files: File[]) => {
    if (!collectionId) {
      toast.error("Önce bir koleksiyon seçin");
      return;
    }
    setProgress(10);
    try {
      await onUploadFiles(files, collectionId);
      setProgress(100);
      toast.success(`${files.length} dosya yüklendi`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally {
      setTimeout(() => setProgress(null), 600);
    }
  };

  const onDrop = (accepted: File[]) => {
    if (accepted.length) void submitFiles(accepted);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    disabled: disabled || !collectionId || noCollection,
    multiple: true,
  });

  return (
    <div className="space-y-6">
      {noCollection ? (
        <div className="bg-muted/40 text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
          Yükleme için önce bir{" "}
          <Link href="/collections" className="text-primary font-medium underline underline-offset-4">
            koleksiyon oluşturun
          </Link>
          .
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Koleksiyon</Label>
          <Select
            value={collectionId || undefined}
            onValueChange={(v) => {
              if (v) setCollectionId(v);
            }}
          >
            <SelectTrigger className="w-full focus-visible:ring-0 focus-visible:border-input">
              <SelectValue placeholder="Koleksiyon seçin">
                {selectedCollectionName || "Koleksiyon seçin"}
              </SelectValue>
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
      </div>

      <div
        {...getRootProps()}
        className={`border-border bg-muted/30 hover:bg-muted/50 flex min-h-40 flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : ""
        } ${
          disabled || !collectionId || noCollection
            ? "pointer-events-none cursor-not-allowed opacity-50"
            : "cursor-pointer"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="text-muted-foreground mb-3 size-8" />
        <p className="text-center text-sm font-medium">
          PDF, DOCX, TXT sürükleyip bırakın — veya tıklayıp seçin
        </p>
        <p className="text-muted-foreground mt-1 text-center text-xs">
          Toplu yükleme desteklenir
        </p>
      </div>

      {progress !== null ? <Progress value={progress} className="h-2" /> : null}

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <LinkIcon className="size-4" />
          Adresten alım (URL)
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="https://ornek.com/docs/sayfa"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={disabled || !url.trim() || !collectionId || noCollection}
            onClick={async () => {
              if (!collectionId) {
                toast.error("Önce bir koleksiyon seçin");
                return;
              }
              try {
                await onIngestUrl(url.trim(), collectionId);
                toast.success("URL alım kuyruğa alındı");
                setUrl("");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Alım başarısız");
              }
            }}
          >
            URL’yi al
          </Button>
        </div>
      </div>
    </div>
  );
}
