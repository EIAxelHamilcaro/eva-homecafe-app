import { useQuery } from "@tanstack/react-query";
import type { FeedGalleryResponse } from "@/types/gallery";
import { api } from "../client";
import { feedGalleryKeys } from "./query-keys";

export function useFeedGallery(page = 1, limit = 10) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return useQuery({
    queryKey: feedGalleryKeys.list(page, limit),
    queryFn: () =>
      api.get<FeedGalleryResponse>(`/api/v1/feed/gallery?${params}`),
    staleTime: 1000 * 60,
  });
}
