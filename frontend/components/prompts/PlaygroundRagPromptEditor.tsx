"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DEFAULT_PLAYGROUND_PROMPTS,
  loadPlaygroundPrompts,
  savePlaygroundPrompts,
  type PlaygroundPromptState,
} from "@/lib/playgroundPrompts";

export function PlaygroundRagPromptEditor() {
  const [prompts, setPrompts] = useState<PlaygroundPromptState>(
    DEFAULT_PLAYGROUND_PROMPTS,
  );

  useEffect(() => {
    setPrompts(loadPlaygroundPrompts());
  }, []);

  function patchPrompts(patch: Partial<PlaygroundPromptState>) {
    setPrompts((prev) => {
      const next = { ...prev, ...patch };
      savePlaygroundPrompts(next);
      return next;
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sorgu laboratuvarı — RAG istem şablonları</CardTitle>
        <CardDescription>
          Yerelde saklanır; laboratuvarda çalıştırdığınız sorgular bu metinleri
          kullanır. Yer tutucular:{" "}
          <code className="bg-muted rounded px-1 text-xs">{`{context}`}</code>,{" "}
          <code className="bg-muted rounded px-1 text-xs">{`{question}`}</code>{" "}
          (bağlam yokken yalnızca soru).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pg-system">Sistem</Label>
          <Textarea
            id="pg-system"
            value={prompts.systemPrompt}
            onChange={(e) => patchPrompts({ systemPrompt: e.target.value })}
            className="min-h-[5.5rem] font-mono text-sm leading-relaxed"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pg-user-ctx">Kullanıcı — bağlam varken</Label>
          <Textarea
            id="pg-user-ctx"
            value={prompts.userPromptWithContext}
            onChange={(e) =>
              patchPrompts({ userPromptWithContext: e.target.value })
            }
            className="min-h-[6.5rem] font-mono text-sm leading-relaxed"
            spellCheck={false}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pg-user-noctx">Kullanıcı — bağlam yokken</Label>
          <Textarea
            id="pg-user-noctx"
            value={prompts.userPromptNoContext}
            onChange={(e) =>
              patchPrompts({ userPromptNoContext: e.target.value })
            }
            className="min-h-[6.5rem] font-mono text-sm leading-relaxed"
            spellCheck={false}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setPrompts(DEFAULT_PLAYGROUND_PROMPTS);
            savePlaygroundPrompts(DEFAULT_PLAYGROUND_PROMPTS);
          }}
        >
          Varsayılanlara dön
        </Button>
      </CardContent>
    </Card>
  );
}
