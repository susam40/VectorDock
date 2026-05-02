import { apiFetch, parseJson } from "@/lib/api/client";

export type AssistantHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function getAssistantPromptDefault(): Promise<{
  system_prompt: string;
}> {
  const res = await apiFetch("/api/assistant/prompt-default");
  return parseJson<{ system_prompt: string }>(res);
}

export async function postAssistantChat(body: {
  message: string;
  history: AssistantHistoryMessage[];
  ollama_model?: string | null;
  system_prompt?: string | null;
}): Promise<{ reply: string }> {
  const res = await apiFetch("/api/assistant/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJson<{ reply: string }>(res);
}
