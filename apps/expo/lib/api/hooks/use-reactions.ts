import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AddReactionInput,
  AddReactionResponse,
  GetMessagesResponse,
  ReactionEmoji,
} from "@/constants/chat";
import { api } from "../client";
import { messageKeys } from "./use-messages";

export const reactionKeys = {
  all: ["reactions"] as const,
  byMessage: (messageId: string) => [...reactionKeys.all, messageId] as const,
};

export interface UseToggleReactionOptions {
  conversationId: string;
  messageId: string;
  userId: string;
}

export function useToggleReaction(options: UseToggleReactionOptions) {
  const { conversationId, messageId, userId } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddReactionInput) =>
      api.post<AddReactionResponse>(
        `/api/v1/chat/messages/${messageId}/reactions`,
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

      queryClient.setQueryData<{
        pages: GetMessagesResponse[];
        pageParams: number[];
      }>(messageKeys.list(conversationId), (old) => {
        if (!old) return old;

        const newPages = old.pages.map((page) => ({
          ...page,
          messages: page.messages.map((message) => {
            if (message.id !== messageId) return message;

            const existingReaction = message.reactions.find(
              (r) => r.userId === userId && r.emoji === input.emoji,
            );

            if (existingReaction) {
              return {
                ...message,
                reactions: message.reactions.filter(
                  (r) => !(r.userId === userId && r.emoji === input.emoji),
                ),
              };
            }

            return {
              ...message,
              reactions: [
                ...message.reactions,
                {
                  userId,
                  emoji: input.emoji,
                  createdAt: new Date().toISOString(),
                },
              ],
            };
          }),
        }));

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
    },
  });
}

export interface UseRemoveReactionOptions {
  conversationId: string;
  messageId: string;
  userId: string;
}

export function useRemoveReaction(options: UseRemoveReactionOptions) {
  const { conversationId, messageId, userId } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emoji: ReactionEmoji) =>
      api.delete<void>(
        `/api/v1/chat/messages/${messageId}/reactions?emoji=${encodeURIComponent(emoji)}`,
      ),
    onMutate: async (emoji) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(conversationId),
      });

      const previousMessages = queryClient.getQueryData<{
        pages: GetMessagesResponse[];
        pageParams: number[];
      }>(messageKeys.list(conversationId));

      queryClient.setQueryData<{
        pages: GetMessagesResponse[];
        pageParams: number[];
      }>(messageKeys.list(conversationId), (old) => {
        if (!old) return old;

        const newPages = old.pages.map((page) => ({
          ...page,
          messages: page.messages.map((message) => {
            if (message.id !== messageId) return message;

            return {
              ...message,
              reactions: message.reactions.filter(
                (r) => !(r.userId === userId && r.emoji === emoji),
              ),
            };
          }),
        }));

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
    },
  });
}
