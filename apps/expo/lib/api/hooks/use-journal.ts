import { useQuery } from "@tanstack/react-query";
import type { JournalResponse } from "@/types/post";
import { api } from "../client";
import { journalKeys } from "./query-keys";

export { journalKeys };

export function useJournalEntries(page = 1, limit = 20, date?: string) {
  return useQuery({
    queryKey: journalKeys.list(page, limit, date),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (date) {
        params.set("date", date);
      }
      return api.get<JournalResponse>(`/api/v1/journal?${params}`);
    },
    staleTime: 1000 * 30,
  });
}
