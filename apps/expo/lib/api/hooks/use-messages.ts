import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  GetMessagesResponse,
  Message,
  SendMessageInput,
  SendMessageResponse,
} from "@/constants/chat";
import { api } from "../client";
import { conversationKeys } from "./use-conversations";

export const messageKeys = {
  all: ["messages"] as const,
  list: (conversationId: string) =>
    [...messageKeys.all, "list", conversationId] as const,
  detail: (id: string) => [...messageKeys.all, id] as const,
};

export interface UseMessagesOptions {
  limit?: number;
}

export function useMessages(
  conversationId: string,
  options?: UseMessagesOptions,
) {
  const { limit = 20 } = options ?? {};

  return useInfiniteQuery({
    queryKey: messageKeys.list(conversationId),
    queryFn: ({ pageParam = 1 }) =>
      api.get<GetMessagesResponse>(
        `/api/v1/chat/conversations/${conversationId}/messages?page=${pageParam}&limit=${limit}`,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination.hasPreviousPage
        ? firstPage.pagination.page - 1
        : undefined,
    enabled: !!conversationId,
  });
}

export interface UseSendMessageOptions {
  conversationId: string;
  senderId: string;
}

export function useSendMessage(options: UseSendMessageOptions) {
  const { conversationId, senderId } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendMessageInput) =>
      api.post<SendMessageResponse>(
        `/api/v1/chat/conversations/${conversationId}/messages`,
        input,
      ),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(conversationId),
      });

      const previousMessages = queryClient.getQueryData<{
        pages: GetMessagesResponse[];
        pageParams: number[];
      }>(messageKeys.list(conversationId));

      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId,
        content: input.content ?? null,
        attachments: input.attachments ?? [],
        reactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        editedAt: null,
        deletedAt: null,
      };

      queryClient.setQueryData<{
        pages: GetMessagesResponse[];
        pageParams: number[];
      }>(messageKeys.list(conversationId), (old) => {
        if (!old) return old;
        const newPages = [...old.pages];
        if (newPages[0]) {
          newPages[0] = {
            ...newPages[0],
            messages: [optimisticMessage, ...newPages[0].messages],
          };
        }
        return { ...old, pages: newPages };
      });

      return { previousMessages };
    },
    onError: (_error, _input, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          messageKeys.list(conversationId),
          context.previousMessages,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.list(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}
