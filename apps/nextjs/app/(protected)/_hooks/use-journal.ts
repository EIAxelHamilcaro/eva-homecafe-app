"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IGetJournalEntriesOutputDto } from "@/application/dto/journal/get-journal-entries.dto";
import type { IGetStreakOutputDto } from "@/application/dto/journal/get-streak.dto";
import type { IUpdatePostOutputDto } from "@/application/dto/post/update-post.dto";
import { apiFetch } from "@/common/api";
import { journalKeys, postKeys } from "./query-keys";

export { journalKeys };

export function useJournalEntriesQuery(page: number) {
  return useQuery<IGetJournalEntriesOutputDto>({
    queryKey: journalKeys.entries(page),
    queryFn: () =>
      apiFetch<IGetJournalEntriesOutputDto>(
        `/api/v1/journal?page=${page}&limit=10`,
      ),
    staleTime: 30_000,
  });
}

export function useJournalStreakQuery() {
  return useQuery<IGetStreakOutputDto>({
    queryKey: journalKeys.streak,
    queryFn: () => apiFetch<IGetStreakOutputDto>("/api/v1/journal/streak"),
    staleTime: 30_000,
  });
}

export function useEditJournalEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    IUpdatePostOutputDto,
    Error,
    { postId: string; content?: string; images?: string[] }
  >({
    mutationFn: ({ postId, content, images }) =>
      apiFetch<IUpdatePostOutputDto>(`/api/v1/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, images }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
