import type { PlaygroundQueryInput, PlaygroundResponse } from "@/lib/types";
import { USE_MOCK, apiFetch, delay, parseJson } from "@/lib/api/client";
import { buildMockPlaygroundResponse } from "@/lib/mock/playground";

export async function runPlaygroundQuery(
  input: PlaygroundQueryInput,
): Promise<PlaygroundResponse> {
  if (USE_MOCK) {
    await delay(450);
    return buildMockPlaygroundResponse(input);
  }
  const res = await apiFetch("/api/playground/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJson<PlaygroundResponse>(res);
}
