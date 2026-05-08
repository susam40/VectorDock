import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { fetchOllamaModels, runPlaygroundQuery } from "@/lib/api/playground";
import type { PlaygroundQueryInput } from "@/lib/types";

export const pk = {
  ollamaModels: ["playground", "ollama-models"] as const,
};

export function usePlaygroundQuery() {
  return useMutation({
    mutationFn: (input: PlaygroundQueryInput) => runPlaygroundQuery(input),
  });
}

export function useOllamaModels() {
  return useQuery({
    queryKey: pk.ollamaModels,
    queryFn: fetchOllamaModels,
  });
}
