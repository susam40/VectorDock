import type { LogEntry } from "@/lib/types";
import { apiFetch, parseJson } from "@/lib/api/client";

export async function fetchLogs(): Promise<LogEntry[]> {
  const res = await apiFetch("/api/logs");
  return parseJson<LogEntry[]>(res);
}
