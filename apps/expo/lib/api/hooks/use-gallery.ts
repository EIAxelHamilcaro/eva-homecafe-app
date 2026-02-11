import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { AddPhotoInput, GalleryResponse, PhotoDto } from "@/types/gallery";
import { api } from "../client";
import { galleryKeys } from "./query-keys";

export { galleryKeys };

export function useGallery(page = 1, limit = 20) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  return useQuery({
    queryKey: galleryKeys.list(page, limit),
    queryFn: () => api.get<GalleryResponse>(`/api/v1/gallery?${params}`),
    staleTime: 1000 * 60,
  });
}

export function useInfiniteGallery(limit = 20) {
  return useInfiniteQuery({
    queryKey: galleryKeys.infinite(limit),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("page", String(pageParam));
      params.set("limit", String(limit));
      return api.get<GalleryResponse>(`/api/v1/gallery?${params}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: 1000 * 60,
  });
}

export function useAddPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddPhotoInput) =>
      api.post<PhotoDto>("/api/v1/gallery", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) =>
      api.delete<{ id: string }>(`/api/v1/gallery/${photoId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}
