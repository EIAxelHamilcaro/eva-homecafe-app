import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateConversationInput,
  CreateConversationResponse,
  GetConversationsResponse,
} from "@/constants/chat";
import { api } from "../client";
import { conversationKeys } from "./query-keys";

export { conversationKeys };

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

export interface UseCreateConversationOptions {
  onError?: () => void;
}

export function useCreateConversation(options?: UseCreateConversationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateConversationInput) =>
      api.post<CreateConversationResponse>("/api/v1/chat/conversations", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
    onError: () => {
      options?.onError?.();
    },
  });
}
