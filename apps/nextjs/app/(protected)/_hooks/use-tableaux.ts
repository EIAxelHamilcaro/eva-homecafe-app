"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ITableauDto } from "@/application/dto/tableau/common-tableau.dto";
import type { IDeleteTableauOutputDto } from "@/application/dto/tableau/delete-tableau.dto";
import type { IGetTableauxOutputDto } from "@/application/dto/tableau/get-tableaux.dto";
import { apiFetch } from "@/common/api";

export const tableauKeys = {
  all: ["tableaux"] as const,
  list: ["tableaux", "list"] as const,
  detail: (id: string) => ["tableaux", "detail", id] as const,
};

export function useTableauxQuery() {
  return useQuery<IGetTableauxOutputDto>({
    queryKey: tableauKeys.list,
    queryFn: () => apiFetch<IGetTableauxOutputDto>("/api/v1/tableaux"),
    staleTime: 30_000,
  });
}

export function useCreateTableauMutation() {
  const queryClient = useQueryClient();

  return useMutation<ITableauDto, Error, { title: string }>({
    mutationFn: (input) =>
      apiFetch<ITableauDto>("/api/v1/tableaux", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableauKeys.all });
    },
  });
}

export function useDeleteTableauMutation() {
  const queryClient = useQueryClient();

  return useMutation<IDeleteTableauOutputDto, Error, { tableauId: string }>({
    mutationFn: ({ tableauId }) =>
      apiFetch<IDeleteTableauOutputDto>(`/api/v1/tableaux/${tableauId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableauKeys.all });
    },
  });
}

export function useAddRowMutation(tableauId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    ITableauDto,
    Error,
    {
      name: string;
      text?: string;
      status?: string;
      priority?: string;
      date?: string;
      files?: string[];
    }
  >({
    mutationFn: (input) =>
      apiFetch<ITableauDto>(`/api/v1/tableaux/${tableauId}/rows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableauKeys.all });
    },
  });
}

export function useUpdateRowMutation(tableauId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    ITableauDto,
    Error,
    {
      rowId: string;
      name?: string;
      text?: string;
      status?: string;
      priority?: string;
      date?: string;
      files?: string[];
    }
  >({
    mutationFn: ({ rowId, ...updates }) =>
      apiFetch<ITableauDto>(`/api/v1/tableaux/${tableauId}/rows/${rowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableauKeys.all });
    },
  });
}

export function useRemoveRowMutation(tableauId: string) {
  const queryClient = useQueryClient();

  return useMutation<ITableauDto, Error, { rowId: string }>({
    mutationFn: ({ rowId }) =>
      apiFetch<ITableauDto>(`/api/v1/tableaux/${tableauId}/rows/${rowId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableauKeys.all });
    },
  });
}
