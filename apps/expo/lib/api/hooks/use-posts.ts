import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreatePostInput,
  Post,
  ToggleReactionResponse,
  UpdatePostInput,
} from "@/types/post";
import { api } from "../client";
import { journalKeys, postKeys } from "./query-keys";

export { postKeys };

export function usePost(postId: string) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => api.get<Post>(`/api/v1/posts/${postId}`),
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) =>
      api.post<Post>("/api/v1/posts", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, ...input }: UpdatePostInput & { postId: string }) =>
      api.patch<Post>(`/api/v1/posts/${postId}`, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({
        queryKey: postKeys.detail(variables.postId),
      });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) =>
      api.delete<{ id: string }>(`/api/v1/posts/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useTogglePostReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, emoji }: { postId: string; emoji: string }) =>
      api.post<ToggleReactionResponse>(`/api/v1/posts/${postId}/reactions`, {
        emoji,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: postKeys.reactions(variables.postId),
      });
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
