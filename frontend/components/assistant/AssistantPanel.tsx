"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Sparkles,
  PanelRightClose,
  Send,
  Loader2,
  Headphones,
  Bot,
  MessageSquarePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/lib/store/store";
import {
  postAssistantChat,
  type AssistantHistoryMessage,
} from "@/lib/api/assistant";

type ChatMessage = AssistantHistoryMessage;

export function AssistantPanel() {
  const open = useUiStore((s) => s.assistantOpen);
  const setOpen = useUiStore((s) => s.setAssistantOpen);
  const toggle = useUiStore((s) => s.toggleAssistant);
  const assistantSystemPrompt = useUiStore((s) => s.assistantSystemPrompt);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const { reply } = await postAssistantChat({
        message: text,
        history: messages,
        system_prompt: assistantSystemPrompt.trim() || null,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
      setError(e instanceof Error ? e.message : "İstek başarısız");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, assistantSystemPrompt]);

  const startNewSession = useCallback(() => {
    if (loading) return;
    setMessages([]);
    setInput("");
    setError(null);
  }, [loading]);

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-4 z-40 hidden max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-white/15 bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-700 px-4 py-3.5 text-left text-white shadow-2xl shadow-indigo-950/40 ring-1 ring-white/10 transition hover:brightness-110 hover:shadow-indigo-950/50 active:scale-[0.98] md:bottom-6 md:right-6 md:flex"
          aria-label="Yardım asistanını aç"
        >
          <span className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Headphones className="size-5 opacity-95" strokeWidth={2} />
            <Sparkles className="absolute -top-1 -right-1 size-3.5 text-amber-200 drop-shadow-sm" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.65rem] font-medium uppercase tracking-wider text-violet-100/90">
              Destek
            </span>
            <span className="block truncate text-sm font-semibold leading-tight">
              Yardım asistanı
            </span>
          </span>
        </button>
      ) : null}

      <aside
        className={cn(
          "border-border bg-background flex flex-col border-l border-l-violet-500/70 shadow-lg transition-[width,opacity] duration-200 md:relative md:h-auto md:shadow-xl",
          open
            ? "fixed inset-0 z-50 w-full md:static md:z-auto md:w-[min(100vw,26rem)] md:shrink-0"
            : "hidden w-0 overflow-hidden border-0 p-0 opacity-0 md:hidden",
        )}
        aria-hidden={!open}
      >
        <div className="flex h-[3.75rem] shrink-0 items-center justify-between gap-2 border-b border-violet-500/15 bg-gradient-to-r from-violet-600/12 via-indigo-600/8 to-transparent px-3 dark:from-violet-500/18 dark:via-indigo-500/12">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="bg-violet-600/15 text-violet-700 dark:bg-violet-400/20 dark:text-violet-200 flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Headphones className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                Yardım asistanı
              </p>
              <p className="text-muted-foreground truncate text-xs">
                VectorDock · canlı destek
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={startNewSession}
              disabled={loading}
              title="Yeni sohbet"
              aria-label="Yeni sohbet"
            >
              <MessageSquarePlus className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => toggle()}
              aria-label="Paneli kapat"
            >
              <PanelRightClose className="size-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="from-muted/40 min-h-0 flex-1 bg-gradient-to-b via-background to-background px-3">
          <div className="flex flex-col gap-4 py-4">
            {messages.length === 0 ? (
              <div className="border-border/80 bg-card/50 mx-0.5 rounded-2xl border p-4 shadow-sm backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2">
                  <span className="bg-violet-600/12 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300 flex size-9 items-center justify-center rounded-xl">
                    <Bot className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Nasıl yardımcı olabilirim?</p>
                    <p className="text-muted-foreground text-xs">
                      Ollama ile yanıtlanır
                    </p>
                  </div>
                </div>
                <ul className="text-muted-foreground space-y-2 text-sm leading-snug">
                  <li className="flex gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-0.5">·</span>
                    Koleksiyon ve belge yükleme adımları
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-0.5">·</span>
                    Playground ve RAG kullanımı
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-600 dark:text-violet-400 mt-0.5">·</span>
                    Loglar ve hata ayıklama
                  </li>
                </ul>
              </div>
            ) : null}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex max-w-[min(100%,20rem)] flex-col gap-1",
                  m.role === "user" ? "self-end items-end" : "self-start items-start",
                )}
              >
                <span
                  className={cn(
                    "px-1 text-[0.65rem] font-medium uppercase tracking-wide",
                    m.role === "user"
                      ? "text-violet-600/90 dark:text-violet-400/90"
                      : "text-muted-foreground",
                  )}
                >
                  {m.role === "user" ? "Siz" : "Asistan"}
                </span>
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                    m.role === "user"
                      ? "rounded-br-md border border-white/10 bg-gradient-to-br from-violet-600 via-violet-600 to-indigo-700 text-white shadow-violet-900/20"
                      : "border-border/70 bg-card/90 text-card-foreground rounded-bl-md border shadow-sm backdrop-blur-sm",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                </div>
              </div>
            ))}
            {loading ? (
              <div className="border-border/60 bg-muted/50 text-muted-foreground flex max-w-[12rem] items-center gap-2 self-start rounded-2xl rounded-bl-md border px-3 py-2.5 text-sm shadow-sm">
                <span className="flex gap-1">
                  <span className="bg-muted-foreground/50 size-1.5 animate-bounce rounded-full [animation-delay:-0.2s]" />
                  <span className="bg-muted-foreground/50 size-1.5 animate-bounce rounded-full [animation-delay:-0.1s]" />
                  <span className="bg-muted-foreground/50 size-1.5 animate-bounce rounded-full" />
                </span>
                <span>Yazılıyor…</span>
              </div>
            ) : null}
            {error ? (
              <div className="border-destructive/30 bg-destructive/5 text-destructive rounded-xl border px-3 py-2 text-sm whitespace-pre-wrap shadow-sm">
                {error}
              </div>
            ) : null}
            <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
          </div>
        </ScrollArea>

        <div className="from-background border-border shrink-0 border-t bg-gradient-to-t to-muted/25 p-3 pt-2">
          <div className="border-violet-500/15 bg-card/80 focus-within:border-violet-500/35 focus-within:ring-violet-500/15 flex items-end gap-2 rounded-2xl border p-1.5 pl-2 shadow-sm backdrop-blur-sm transition-[box-shadow,border-color] focus-within:ring-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mesajınızı yazın…"
              className="max-h-36 min-h-[2.75rem] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              onClick={() => void send()}
              disabled={loading || !input.trim()}
              className="size-10 shrink-0 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-md shadow-violet-900/25 hover:brightness-110 disabled:opacity-40"
              aria-label="Gönder"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-center text-[0.65rem] leading-none">
            Enter gönderir · Shift+Enter yeni satır
          </p>
        </div>
      </aside>
    </>
  );
}
