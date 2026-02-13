"use client";

import { useQuery } from "@tanstack/react-query";
import type { IGetFriendFeedOutputDto } from "@/application/dto/feed/get-friend-feed.dto";
import { apiFetch } from "@/common/api";

export const feedKeys = {
  all: ["feed"] as const,
  unified: (page: number) => ["feed", "unified", page] as const,
  friends: (page: number) => ["feed", "friends", page] as const,
};

export function useUnifiedFeedQuery(page: number) {
  return useQuery<IGetFriendFeedOutputDto>({
    queryKey: feedKeys.unified(page),
    queryFn: () =>
      apiFetch<IGetFriendFeedOutputDto>(
        `/api/v1/feed/unified?page=${page}&limit=10`,
      ),
    staleTime: 30_000,
  });
}

export function useFriendFeedQuery(page: number) {
  return useQuery<IGetFriendFeedOutputDto>({
    queryKey: feedKeys.friends(page),
    queryFn: () =>
      apiFetch<IGetFriendFeedOutputDto>(`/api/v1/feed?page=${page}&limit=20`),
    staleTime: 30_000,
  });
}
