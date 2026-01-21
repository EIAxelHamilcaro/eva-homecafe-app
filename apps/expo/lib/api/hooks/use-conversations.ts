import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateConversationInput,
  CreateConversationResponse,
  GetConversationsResponse,
} from "@/constants/chat";
import { api } from "../client";

export const conversationKeys = {
  all: ["conversations"] as const,
  list: (pagination?: { page: number; limit: number }) =>
    [...conversationKeys.all, "list", pagination] as const,
  detail: (id: string) => [...conversationKeys.all, id] as const,
};

export interface UseConversationsOptions {
  page?: number;
  limit?: number;
}

export function useConversations(options?: UseConversationsOptions) {
  const { page = 1, limit = 20 } = options ?? {};

  return useQuery({
    queryKey: conversationKeys.list({ page, limit }),
    queryFn: () =>
      api.get<GetConversationsResponse>(
        `/api/v1/chat/conversations?page=${page}&limit=${limit}`,
      ),
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateConversationInput) =>
      api.post<CreateConversationResponse>("/api/v1/chat/conversations", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}
