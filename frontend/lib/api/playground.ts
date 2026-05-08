import type { PlaygroundQueryInput, PlaygroundResponse } from "@/lib/types";
import { apiFetch, parseJson } from "@/lib/api/client";

export async function fetchOllamaModels(): Promise<{
  models: string[];
}> {
  const res = await apiFetch("/api/playground/ollama-models");
  return parseJson(res);
}

export async function runPlaygroundQuery(
  input: PlaygroundQueryInput,
): Promise<PlaygroundResponse> {
  const res = await apiFetch("/api/playground/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<PlaygroundResponse>(res);
}
