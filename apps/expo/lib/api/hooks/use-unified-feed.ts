import { useQuery } from "@tanstack/react-query";
import type { FeedResponse } from "@/types/post";
import { api } from "../client";
import { feedKeys } from "./query-keys";

export function useUnifiedFeed(page = 1, limit = 10) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return useQuery({
    queryKey: feedKeys.unified(page, limit),
    queryFn: () => api.get<FeedResponse>(`/api/v1/feed/unified?${params}`),
    staleTime: 1000 * 30,
  });
}
