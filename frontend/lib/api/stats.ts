import type { ActivityPoint, StatsOverview } from "@/lib/types";
import { USE_MOCK, apiFetch, delay, parseJson } from "@/lib/api/client";
import { getMockActivity, getMockStats } from "@/lib/mock/stats";

export async function fetchStats(): Promise<StatsOverview> {
  if (USE_MOCK) {
    await delay(150);
    return getMockStats();
  }
  const res = await apiFetch("/api/stats");
  return parseJson<StatsOverview>(res);
}

export async function fetchActivity(): Promise<ActivityPoint[]> {
  if (USE_MOCK) {
    await delay(120);
    return getMockActivity();
  }
  const res = await apiFetch("/api/stats/activity");
  return parseJson<ActivityPoint[]>(res);
}
