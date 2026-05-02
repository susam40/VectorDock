import { useMutation } from "@tanstack/react-query";
import { runPlaygroundQuery } from "@/lib/api/playground";
import type { PlaygroundQueryInput } from "@/lib/types";

export function usePlaygroundQuery() {
  return useMutation({
    mutationFn: (input: PlaygroundQueryInput) => runPlaygroundQuery(input),
  });
}
