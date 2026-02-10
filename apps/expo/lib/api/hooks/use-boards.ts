import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddCardInput,
  BoardDto,
  ChronologyResponse,
  CreateBoardInput,
  CreateKanbanBoardInput,
  GetBoardsResponse,
  MoveCardInput,
  UpdateBoardInput,
  UpdateCardInput,
} from "@/types/board";
import { api } from "../client";
import { boardKeys } from "./query-keys";

export { boardKeys };

export function useBoards(type?: "todo" | "kanban", page = 1, limit = 20) {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  params.set("page", String(page));
  params.set("limit", String(limit));

  return useQuery({
    queryKey: boardKeys.list(type, page, limit),
    queryFn: () => api.get<GetBoardsResponse>(`/api/v1/boards?${params}`),
    staleTime: 1000 * 60,
  });
}

export function useChronology(month?: string) {
  const params = new URLSearchParams();
  if (month) params.set("month", month);

  return useQuery({
    queryKey: boardKeys.chronology(month),
    queryFn: () =>
      api.get<ChronologyResponse>(
        `/api/v1/boards/chronology${params.toString() ? `?${params}` : ""}`,
      ),
    staleTime: 1000 * 60,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBoardInput) =>
      api.post<BoardDto>("/api/v1/boards", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}

export function useCreateKanbanBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateKanbanBoardInput) =>
      api.post<BoardDto>("/api/v1/boards/kanban", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      ...data
    }: UpdateBoardInput & { boardId: string }) =>
      api.put<BoardDto>(`/api/v1/boards/${boardId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) =>
      api.delete<{ id: string }>(`/api/v1/boards/${boardId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}

export function useAddColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, title }: { boardId: string; title: string }) =>
      api.post<BoardDto>(`/api/v1/boards/${boardId}/columns`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}

export function useAddCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardId, ...data }: AddCardInput & { boardId: string }) =>
      api.post<BoardDto>(`/api/v1/boards/${boardId}/cards`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      cardId,
      ...data
    }: UpdateCardInput & { boardId: string; cardId: string }) =>
      api.put<BoardDto>(`/api/v1/boards/${boardId}/cards/${cardId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}

export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      cardId,
      ...data
    }: MoveCardInput & { boardId: string; cardId: string }) =>
      api.put<BoardDto>(`/api/v1/boards/${boardId}/cards/${cardId}/move`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
}
