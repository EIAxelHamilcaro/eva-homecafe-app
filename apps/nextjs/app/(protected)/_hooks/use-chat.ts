"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "@/common/api";
import type {
  AddReactionResponse,
  Attachment,
  CreateConversationResponse,
  GetConversationsResponse,
  GetMessagesResponse,
  Message,
  ProfileBatchResponse,
  ReactionEmoji,
  SearchRecipientsResponse,
} from "../messages/_constants/chat";
import {
  conversationKeys,
  messageKeys,
  profileKeys,
  recipientKeys,
} from "./query-keys";
import { notificationKeys } from "./use-notifications";

export function useConversationsQuery() {
  return useQuery<GetConversationsResponse>({
    queryKey: conversationKeys.list,
    queryFn: () =>
      apiFetch<GetConversationsResponse>(
        "/api/v1/chat/conversations?page=1&limit=50",
      ),
  });
}

export function useMessagesQuery(conversationId: string) {
  return useInfiniteQuery<GetMessagesResponse>({
    queryKey: messageKeys.list(conversationId),
    queryFn: ({ pageParam = 1 }) =>
      apiFetch<GetMessagesResponse>(
        `/api/v1/chat/conversations/${conversationId}/messages?page=${pageParam}&limit=15`,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: !!conversationId,
  });
}

export function useUploadMediaMutation() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const results: Attachment[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await apiFetch<Attachment>("/api/v1/chat/upload", {
          method: "POST",
          body: formData,
        });
        results.push(result);
      }
      return results;
    },
  });
}

export function useSendMessageMutation(
  conversationId: string,
  senderId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { content?: string; attachments?: Attachment[] }) =>
      apiFetch<{ messageId: string }>(
        `/api/v1/chat/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      ),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(conversationId),
      });

      const previous = queryClient.getQueryData<{
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

      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          messageKeys.list(conversationId),
          context.previous,
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

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { recipientId: string }) =>
      apiFetch<CreateConversationResponse>("/api/v1/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

export function useToggleReactionMutation(
  conversationId: string,
  messageId: string,
  userId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { emoji: ReactionEmoji }) =>
      apiFetch<AddReactionResponse>(
        `/api/v1/chat/messages/${messageId}/reactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      ),
    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(conversationId),
      });

      const previous = queryClient.getQueryData<{
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
          messages: page.messages.map((msg) => {
            if (msg.id !== messageId) return msg;

            const hasSameReaction = msg.reactions.some(
              (r) => r.userId === userId && r.emoji === input.emoji,
            );

            if (hasSameReaction) {
              return {
                ...msg,
                reactions: msg.reactions.filter(
                  (r) => !(r.userId === userId && r.emoji === input.emoji),
                ),
              };
            }

            return {
              ...msg,
              reactions: [
                ...msg.reactions.filter((r) => r.userId !== userId),
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

      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          messageKeys.list(conversationId),
          context.previous,
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

export function useMarkAsReadMutation(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiFetch(`/api/v1/chat/conversations/${conversationId}/read`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      apiFetch(`/api/v1/chat/conversations/${conversationId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

export function useSearchRecipientsQuery(query: string) {
  return useQuery<SearchRecipientsResponse>({
    queryKey: recipientKeys.search(query),
    queryFn: () =>
      apiFetch<SearchRecipientsResponse>(
        `/api/v1/chat/recipients?search=${encodeURIComponent(query)}`,
      ),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}

export function useProfilesQuery(userIds: string[]) {
  const uniqueIds = [...new Set(userIds)].sort();

  return useQuery<ProfileBatchResponse>({
    queryKey: profileKeys.batch(uniqueIds),
    queryFn: () =>
      apiFetch<ProfileBatchResponse>(
        `/api/v1/profiles?ids=${uniqueIds.join(",")}`,
      ),
    enabled: uniqueIds.length > 0,
    staleTime: 5 * 60_000,
  });
}
