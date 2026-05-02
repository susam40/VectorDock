"use client";

import { useCallback, useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUiStore } from "@/lib/store/store";
import { getAssistantPromptDefault } from "@/lib/api/assistant";

const MAX_LEN = 16000;

export function AssistantPromptEditor() {
  const prompt = useUiStore((s) => s.assistantSystemPrompt);
  const setPrompt = useUiStore((s) => s.setAssistantSystemPrompt);
  const [loadingDefault, setLoadingDefault] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cur = useUiStore.getState().assistantSystemPrompt;
      if (cur.trim()) return;
      try {
        const { system_prompt } = await getAssistantPromptDefault();
        if (cancelled) return;
        if (!useUiStore.getState().assistantSystemPrompt.trim()) {
          setPrompt(system_prompt);
        }
      } catch {
        /* API yoksa alan boş kalır */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setPrompt]);

  const resetToDefault = useCallback(async () => {
    setLoadingDefault(true);
    try {
      const { system_prompt } = await getAssistantPromptDefault();
      setPrompt(system_prompt);
    } finally {
      setLoadingDefault(false);
    }
  }, [setPrompt]);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
        <div className="space-y-1.5">
          <CardTitle>Yardım asistanı — sistem istemi</CardTitle>
          <CardDescription>
            Sağdaki yardım panelindeki sohbetlerde modele gönderilen talimat
            metnidir. Tarayıcıda saklanır; boş bırakırsanız sunucu varsayılanı
            kullanılır.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2"
          onClick={() => void resetToDefault()}
          disabled={loadingDefault}
        >
          <RotateCcw className="size-4" />
          Sunucu varsayılanına dön
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="assistant-system-prompt">İstem metni</Label>
          <Textarea
            id="assistant-system-prompt"
            value={prompt}
            onChange={(e) =>
              setPrompt(e.target.value.slice(0, MAX_LEN))
            }
            placeholder="Boşsa sunucu varsayılanı kullanılır."
            className="min-h-[min(24rem,calc(100vh-20rem))] resize-y font-mono text-sm leading-relaxed"
            spellCheck={false}
          />
        </div>
        <p className="text-muted-foreground text-sm">
          {prompt.trim()
            ? `${prompt.length.toLocaleString("tr-TR")} / ${MAX_LEN.toLocaleString("tr-TR")} karakter`
            : "Boş gönderimde API varsayılan istemi uygulanır."}
        </p>
      </CardContent>
    </Card>
  );
}
