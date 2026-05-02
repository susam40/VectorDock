import type { ActivityPoint, StatsOverview } from "@/lib/types";
import { apiFetch, parseJson } from "@/lib/api/client";

export async function fetchStats(): Promise<StatsOverview> {
  const res = await apiFetch("/api/stats");
  return parseJson<StatsOverview>(res);
}

export async function fetchActivity(): Promise<ActivityPoint[]> {
  const res = await apiFetch("/api/stats/activity");
  return parseJson<ActivityPoint[]>(res);
}
