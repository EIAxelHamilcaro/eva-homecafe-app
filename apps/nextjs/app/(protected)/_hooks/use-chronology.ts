"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IChronologieDto } from "@/application/dto/chronologie/common-chronologie.dto";
import { apiFetch } from "@/common/api";

export const chronologieKeys = {
  all: ["chronologies"] as const,
  list: ["chronologies", "list"] as const,
};

interface IGetChronologiesOutputDto {
  chronologies: IChronologieDto[];
}

export function useChronologiesQuery() {
  return useQuery<IGetChronologiesOutputDto>({
    queryKey: chronologieKeys.list,
    queryFn: () => apiFetch<IGetChronologiesOutputDto>("/api/v1/chronologies"),
    staleTime: 30_000,
  });
}

export function useCreateChronologieMutation() {
  const queryClient = useQueryClient();

  return useMutation<IChronologieDto, Error, { title: string }>({
    mutationFn: (input) =>
      apiFetch<IChronologieDto>("/api/v1/chronologies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chronologieKeys.all });
    },
  });
}

export function useDeleteChronologieMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ deletedId: string }, Error, { chronologieId: string }>({
    mutationFn: ({ chronologieId }) =>
      apiFetch<{ deletedId: string }>(`/api/v1/chronologies/${chronologieId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chronologieKeys.all });
    },
  });
}

export function useAddEntryMutation(chronologieId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    IChronologieDto,
    Error,
    {
      title: string;
      startDate?: string;
      endDate?: string;
      color?: number;
    }
  >({
    mutationFn: (input) =>
      apiFetch<IChronologieDto>(
        `/api/v1/chronologies/${chronologieId}/entries`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chronologieKeys.all });
    },
  });
}

export function useUpdateEntryMutation(chronologieId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    IChronologieDto,
    Error,
    {
      entryId: string;
      title?: string;
      startDate?: string | null;
      endDate?: string | null;
      color?: number;
    }
  >({
    mutationFn: ({ entryId, ...updates }) =>
      apiFetch<IChronologieDto>(
        `/api/v1/chronologies/${chronologieId}/entries/${entryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chronologieKeys.all });
    },
  });
}

export function useRemoveEntryMutation(chronologieId: string) {
  const queryClient = useQueryClient();

  return useMutation<IChronologieDto, Error, { entryId: string }>({
    mutationFn: ({ entryId }) =>
      apiFetch<IChronologieDto>(
        `/api/v1/chronologies/${chronologieId}/entries/${entryId}`,
        { method: "DELETE" },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chronologieKeys.all });
    },
  });
}
