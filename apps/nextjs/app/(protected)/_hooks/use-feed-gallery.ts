"use client";

import { useQuery } from "@tanstack/react-query";
import type { GetFeedGalleryOutputDto } from "@/adapters/queries/feed-gallery.query";
import { apiFetch } from "@/common/api";

export const feedGalleryKeys = {
  all: ["feed-gallery"] as const,
  list: (page: number, limit: number) =>
    ["feed-gallery", "list", page, limit] as const,
};

export function useFeedGalleryQuery(page: number, limit = 20) {
  return useQuery<GetFeedGalleryOutputDto>({
    queryKey: feedGalleryKeys.list(page, limit),
    queryFn: () =>
      apiFetch<GetFeedGalleryOutputDto>(
        `/api/v1/feed/gallery?page=${page}&limit=${limit}`,
      ),
    staleTime: 30_000,
  });
}
