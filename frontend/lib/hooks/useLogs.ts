import { useQuery } from "@tanstack/react-query";
import { fetchLogs } from "@/lib/api/logs";

export const lk = { logs: ["logs"] as const };

export function useLogs() {
  return useQuery({ queryKey: lk.logs, queryFn: fetchLogs });
}
