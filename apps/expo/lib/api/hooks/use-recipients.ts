import { useQuery } from "@tanstack/react-query";
import type { SearchRecipientsResponse } from "@/constants/chat";
import { api } from "../client";

export const recipientKeys = {
  all: ["recipients"] as const,
  search: (query: string) => [...recipientKeys.all, "search", query] as const,
};

export interface UseSearchRecipientsOptions {
  query: string;
  limit?: number;
  enabled?: boolean;
}

export function useSearchRecipients(options: UseSearchRecipientsOptions) {
  const { query, limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: recipientKeys.search(query),
    queryFn: () =>
      api.get<SearchRecipientsResponse>(
        `/api/v1/chat/recipients?search=${encodeURIComponent(query)}&limit=${limit}`,
      ),
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 1000,
  });
}
