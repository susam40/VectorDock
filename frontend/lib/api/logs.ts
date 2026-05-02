import type { LogEntry } from "@/lib/types";
import { USE_MOCK, apiFetch, delay, parseJson } from "@/lib/api/client";
import { MOCK_LOGS } from "@/lib/mock/logs";

export async function fetchLogs(): Promise<LogEntry[]> {
  if (USE_MOCK) {
    await delay(120);
    return [...MOCK_LOGS].sort(
      (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime(),
    );
  }
  const res = await apiFetch("/api/logs");
  return parseJson<LogEntry[]>(res);
}
