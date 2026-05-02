"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LogEntry, LogType } from "@/lib/types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { logTypeTr } from "@/lib/tr";

const typeColors: Record<
  LogType,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ingestion: "secondary",
  query: "default",
  error: "destructive",
  system: "outline",
};

export function LogViewer({ logs }: { logs: LogEntry[] }) {
  const [filter, setFilter] = useState<"all" | LogType>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (filter !== "all" && l.type !== filter) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        l.message.toLowerCase().includes(s) ||
        l.traceId?.toLowerCase().includes(s)
      );
    });
  }, [logs, filter, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Günlüklerde ara…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-md"
        />
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as typeof filter)}
        >
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="ingestion">Alım</TabsTrigger>
            <TabsTrigger value="query">Sorgu</TabsTrigger>
            <TabsTrigger value="error">Hatalar</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ScrollArea className="h-[560px] rounded-md border">
        <div className="divide-y">
          {filtered.map((l) => (
            <LogRow key={l.id} entry={l} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function LogRow({ entry }: { entry: LogEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground font-mono text-xs">
          {format(new Date(entry.ts), "dd.MM.yyyy HH:mm:ss", { locale: tr })}
        </span>
        <Badge variant={typeColors[entry.type]}>{logTypeTr[entry.type]}</Badge>
        {entry.traceId ? (
          <span className="font-mono text-xs">{entry.traceId}</span>
        ) : null}
      </div>
      <p className="mt-2 text-sm">{entry.message}</p>
      {entry.payload ? (
        <button
          type="button"
          className="text-primary mt-2 text-xs font-medium"
          onClick={() => setOpen(!open)}
        >
          {open ? "Yükü gizle" : "Yükü göster"}
        </button>
      ) : null}
      {open && entry.payload ? (
        <pre className="bg-muted/50 mt-2 overflow-x-auto rounded p-3 text-xs">
          {JSON.stringify(entry.payload, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
