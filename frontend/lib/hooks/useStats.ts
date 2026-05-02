import { useQuery } from "@tanstack/react-query";
import { fetchActivity, fetchStats } from "@/lib/api/stats";

export const sk = {
  stats: ["stats"] as const,
  activity: ["stats", "activity"] as const,
};

export function useStats() {
  return useQuery({ queryKey: sk.stats, queryFn: fetchStats });
}

export function useActivity() {
  return useQuery({ queryKey: sk.activity, queryFn: fetchActivity });
}
