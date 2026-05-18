import { apiFetch, parseJson } from "@/lib/api/client";

export type AssistantHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantChatBody = {
  message: string;
  history: AssistantHistoryMessage[];
  ollama_model?: string | null;
  system_prompt?: string | null;
};

type StreamLine = {
  delta?: string;
  done?: boolean;
  error?: string;
};

function parseStreamLine(line: string): StreamLine | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as StreamLine;
  } catch {
    return null;
  }
}

export async function getAssistantPromptDefault(): Promise<{
  system_prompt: string;
}> {
  const res = await apiFetch("/api/assistant/prompt-default");
  return parseJson<{ system_prompt: string }>(res);
}

export async function postAssistantChat(body: AssistantChatBody): Promise<{ reply: string }> {
  const res = await apiFetch("/api/assistant/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<{ reply: string }>(res);
}

export async function streamAssistantChat(
  body: AssistantChatBody,
  handlers: {
    onDelta: (text: string) => void;
    onDone: () => void;
    onError: (message: string) => void;
  },
  signal?: AbortSignal,
): Promise<void> {
  const res = await apiFetch("/api/assistant/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("Akış desteklenmiyor.");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;

  const handleLine = (line: string) => {
    const parsed = parseStreamLine(line);
    if (!parsed) return;
    if (parsed.error) {
      handlers.onError(parsed.error);
      finished = true;
      return;
    }
    if (parsed.delta) handlers.onDelta(parsed.delta);
    if (parsed.done) {
      handlers.onDone();
      finished = true;
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) handleLine(line);
      if (finished) break;
    }
    if (buffer.trim()) handleLine(buffer);
    if (!finished) handlers.onDone();
  } finally {
    reader.releaseLock();
  }
}
