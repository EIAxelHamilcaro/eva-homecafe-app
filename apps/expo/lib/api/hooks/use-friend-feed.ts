import { useInfiniteQuery } from "@tanstack/react-query";
import type { FeedResponse } from "@/types/post";
import { api } from "../client";
import { feedKeys } from "./query-keys";

export function useFriendFeed(limit = 20) {
  return useInfiniteQuery({
    queryKey: feedKeys.list(undefined, limit),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: String(limit),
      });
      return api.get<FeedResponse>(`/api/v1/feed?${params}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: 1000 * 30,
  });
}
