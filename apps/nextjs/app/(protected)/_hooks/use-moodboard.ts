"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  GetUserMoodboardsOutputDto,
  MoodboardDetailDto,
} from "@/adapters/queries/moodboard.query";
import type { IDeleteMoodboardOutputDto } from "@/application/dto/moodboard/delete-moodboard.dto";
import { apiFetch } from "@/common/api";

export const moodboardKeys = {
  all: ["moodboards"] as const,
  list: (page: number) => ["moodboards", "list", page] as const,
  detail: (id: string) => ["moodboards", "detail", id] as const,
  pins: (id: string) => ["moodboards", "pins", id] as const,
};

export function useMoodboardsQuery(page: number) {
  return useQuery<GetUserMoodboardsOutputDto>({
    queryKey: moodboardKeys.list(page),
    queryFn: () =>
      apiFetch<GetUserMoodboardsOutputDto>(
        `/api/v1/moodboards?page=${page}&limit=20`,
      ),
    staleTime: 30_000,
  });
}

export function useMoodboardDetailQuery(id: string | undefined) {
  return useQuery<MoodboardDetailDto>({
    queryKey: moodboardKeys.detail(id ?? ""),
    queryFn: () => apiFetch<MoodboardDetailDto>(`/api/v1/moodboards/${id}`),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useDeleteMoodboardMutation() {
  const queryClient = useQueryClient();

  return useMutation<IDeleteMoodboardOutputDto, Error, { id: string }>({
    mutationFn: ({ id }) =>
      apiFetch<IDeleteMoodboardOutputDto>(`/api/v1/moodboards/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.all });
    },
  });
}
