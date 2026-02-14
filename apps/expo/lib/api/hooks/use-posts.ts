import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreatePostInput,
  Post,
  PostComment,
  PostCommentsResponse,
  PostReactionsResponse,
  ToggleReactionResponse,
  UpdatePostInput,
} from "@/types/post";
import { api } from "../client";
import { feedKeys, journalKeys, postKeys } from "./query-keys";

export { postKeys };

interface UserPostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function useUserPosts(page = 1, limit = 10) {
  return useQuery({
    queryKey: postKeys.list(page, limit),
    queryFn: () =>
      api.get<UserPostsResponse>(`/api/v1/posts?page=${page}&limit=${limit}`),
    staleTime: 1000 * 30,
  });
}

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
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
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
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

export function usePostReactions(postId: string) {
  return useQuery({
    queryKey: postKeys.reactions(postId),
    queryFn: () =>
      api.get<PostReactionsResponse>(`/api/v1/posts/${postId}/reactions`),
    staleTime: 1000 * 30,
    enabled: !!postId,
  });
}

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: postKeys.comments(postId),
    queryFn: () =>
      api.get<PostCommentsResponse>(`/api/v1/posts/${postId}/comments`),
    staleTime: 1000 * 30,
    enabled: !!postId,
  });
}

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content }: { content: string }) =>
      api.post<PostComment>(`/api/v1/posts/${postId}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postKeys.comments(postId),
      });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string }) =>
      api.delete<void>(`/api/v1/posts/${postId}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postKeys.comments(postId),
      });
    },
  });
}

export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) =>
      api.patch<PostComment>(`/api/v1/posts/${postId}/comments/${commentId}`, {
        content,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postKeys.comments(postId),
      });
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
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}
