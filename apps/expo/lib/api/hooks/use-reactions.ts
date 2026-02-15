import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AddReactionResponse,
  GetMessagesResponse,
  ReactionEmoji,
} from "@/constants/chat";
import { api } from "../client";
import { messageKeys, reactionKeys } from "./query-keys";

export { reactionKeys };

interface ToggleReactionInput {
  messageId: string;
  emoji: ReactionEmoji;
}

export interface UseToggleReactionOptions {
  conversationId: string;
  userId: string;
  onError?: () => void;
}

export function useToggleReaction(options: UseToggleReactionOptions) {
  const { conversationId, userId, onError } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ToggleReactionInput) =>
      api.post<AddReactionResponse>(
        `/api/v1/chat/messages/${input.messageId}/reactions`,
        { emoji: input.emoji },
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
            if (message.id !== input.messageId) return message;

            const hasSameReaction = message.reactions.some(
              (r) => r.userId === userId && r.emoji === input.emoji,
            );

            if (hasSameReaction) {
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
                ...message.reactions.filter((r) => r.userId !== userId),
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
      onError?.();
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.list(conversationId),
      });
    },
  });
}

interface RemoveReactionInput {
  messageId: string;
  emoji: ReactionEmoji;
}

export interface UseRemoveReactionOptions {
  conversationId: string;
  userId: string;
}

export function useRemoveReaction(options: UseRemoveReactionOptions) {
  const { conversationId, userId } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RemoveReactionInput) =>
      api.delete<void>(
        `/api/v1/chat/messages/${input.messageId}/reactions?emoji=${encodeURIComponent(input.emoji)}`,
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
            if (message.id !== input.messageId) return message;

            return {
              ...message,
              reactions: message.reactions.filter(
                (r) => !(r.userId === userId && r.emoji === input.emoji),
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
