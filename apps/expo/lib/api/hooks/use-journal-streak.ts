import { useQuery } from "@tanstack/react-query";
import type { StreakResponse } from "@/types/post";
import { api } from "../client";
import { journalKeys } from "./query-keys";

export function useJournalStreak() {
  return useQuery({
    queryKey: journalKeys.streak(),
    queryFn: () => api.get<StreakResponse>("/api/v1/journal/streak"),
    staleTime: 1000 * 60,
  });
}
