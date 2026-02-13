"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IAddCardOutputDto } from "@/application/dto/board/add-card.dto";
import type { IAddColumnOutputDto } from "@/application/dto/board/add-column.dto";
import type { IBoardDto } from "@/application/dto/board/common-board.dto";
import type { IDeleteBoardOutputDto } from "@/application/dto/board/delete-board.dto";
import type { IGetBoardsOutputDto } from "@/application/dto/board/get-boards.dto";
import type { IMoveCardOutputDto } from "@/application/dto/board/move-card.dto";
import { apiFetch } from "@/common/api";

export const boardKeys = {
  all: ["boards"] as const,
  list: ["boards", "list"] as const,
  detail: (id: string) => ["boards", "detail", id] as const,
};

export function useBoardsQuery() {
  return useQuery<IGetBoardsOutputDto>({
    queryKey: boardKeys.list,
    queryFn: () => apiFetch<IGetBoardsOutputDto>("/api/v1/boards"),
    staleTime: 30_000,
  });
}

export function useBoardDetailQuery(id: string | undefined) {
  return useQuery<IBoardDto>({
    queryKey: boardKeys.detail(id ?? ""),
    queryFn: () => apiFetch<IBoardDto>(`/api/v1/boards/${id}`),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useAddCardMutation(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    IAddCardOutputDto,
    Error,
    {
      columnId: string;
      title: string;
      description?: string | null;
      progress?: number;
      dueDate?: string | null;
    }
  >({
    mutationFn: (input) =>
      apiFetch<IAddCardOutputDto>(`/api/v1/boards/${boardId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(boardId),
      });
    },
  });
}

export function useMoveCardMutation(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    IMoveCardOutputDto,
    Error,
    { cardId: string; toColumnId: string; newPosition: number }
  >({
    mutationFn: ({ cardId, toColumnId, newPosition }) =>
      apiFetch<IMoveCardOutputDto>(
        `/api/v1/boards/${boardId}/cards/${cardId}/move`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toColumnId, newPosition }),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(boardId),
      });
    },
  });
}

export function useAddColumnMutation(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation<IAddColumnOutputDto, Error, { title: string }>({
    mutationFn: ({ title }) =>
      apiFetch<IAddColumnOutputDto>(`/api/v1/boards/${boardId}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: boardKeys.detail(boardId),
      });
    },
  });
}

export function useDeleteBoardMutation() {
  const queryClient = useQueryClient();

  return useMutation<IDeleteBoardOutputDto, Error, { boardId: string }>({
    mutationFn: ({ boardId }) =>
      apiFetch<IDeleteBoardOutputDto>(`/api/v1/boards/${boardId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}
