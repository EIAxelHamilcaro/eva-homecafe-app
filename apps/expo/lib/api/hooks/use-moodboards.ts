import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  AddPinInput,
  AddPinOutput,
  CreateMoodboardInput,
  CreateMoodboardOutput,
  MoodboardDetailDto,
  MoodboardListResponse,
} from "@/types/moodboard";
import { api } from "../client";
import { moodboardKeys } from "./query-keys";

export function useMoodboards(page = 1, limit = 20) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  return useQuery({
    queryKey: moodboardKeys.list(page, limit),
    queryFn: () =>
      api.get<MoodboardListResponse>(`/api/v1/moodboards?${params}`),
    staleTime: 1000 * 60,
  });
}

export function useInfiniteMoodboards(limit = 20) {
  return useInfiniteQuery({
    queryKey: moodboardKeys.infinite(limit),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("page", String(pageParam));
      params.set("limit", String(limit));
      return api.get<MoodboardListResponse>(`/api/v1/moodboards?${params}`);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: 1000 * 60,
  });
}

export function useMoodboardDetail(id: string) {
  return useQuery({
    queryKey: moodboardKeys.detail(id),
    queryFn: () => api.get<MoodboardDetailDto>(`/api/v1/moodboards/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

export function useCreateMoodboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMoodboardInput) =>
      api.post<CreateMoodboardOutput>("/api/v1/moodboards", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.all });
    },
  });
}

export function useDeleteMoodboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (moodboardId: string) =>
      api.delete<{ id: string }>(`/api/v1/moodboards/${moodboardId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.all });
    },
  });
}

export function useAddPin(moodboardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddPinInput) =>
      api.post<AddPinOutput>(`/api/v1/moodboards/${moodboardId}/pins`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.all });
      queryClient.invalidateQueries({
        queryKey: moodboardKeys.detail(moodboardId),
      });
    },
  });
}

export function useDeletePin(moodboardId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pinId: string) =>
      api.delete<{ id: string }>(
        `/api/v1/moodboards/${moodboardId}/pins/${pinId}`,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.all });
      queryClient.invalidateQueries({
        queryKey: moodboardKeys.detail(moodboardId),
      });
    },
  });
}
