"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  IGetPostCommentsOutputDto,
  IPostCommentDto,
} from "@/adapters/queries/post-comments.query";
import type { IGetPostReactionsOutputDto } from "@/adapters/queries/post-reactions.query";
import type { IDeletePostOutputDto } from "@/application/dto/post/delete-post.dto";
import type { IGetPostDetailOutputDto } from "@/application/dto/post/get-post-detail.dto";
import type { IGetUserPostsOutputDto } from "@/application/dto/post/get-user-posts.dto";
import type { ITogglePostReactionOutputDto } from "@/application/dto/post/toggle-post-reaction.dto";
import type { IUpdatePostOutputDto } from "@/application/dto/post/update-post.dto";
import { apiFetch } from "@/common/api";

export const postKeys = {
  all: ["posts"] as const,
  list: (page: number) => ["posts", "list", page] as const,
  detail: (id: string) => ["posts", "detail", id] as const,
  reactions: (id: string) => ["posts", "reactions", id] as const,
  comments: (id: string) => ["posts", "comments", id] as const,
};

export function usePostsQuery(page: number) {
  return useQuery<IGetUserPostsOutputDto>({
    queryKey: postKeys.list(page),
    queryFn: () =>
      apiFetch<IGetUserPostsOutputDto>(`/api/v1/posts?page=${page}&limit=10`),
    staleTime: 30_000,
  });
}

export function usePostDetailQuery(postId: string) {
  return useQuery<IGetPostDetailOutputDto>({
    queryKey: postKeys.detail(postId),
    queryFn: () => apiFetch<IGetPostDetailOutputDto>(`/api/v1/posts/${postId}`),
    staleTime: 30_000,
    enabled: !!postId,
  });
}

export function usePostReactionsQuery(postId: string) {
  return useQuery<IGetPostReactionsOutputDto>({
    queryKey: postKeys.reactions(postId),
    queryFn: () =>
      apiFetch<IGetPostReactionsOutputDto>(`/api/v1/posts/${postId}/reactions`),
    staleTime: 30_000,
    enabled: !!postId,
  });
}

export function usePostCommentsQuery(postId: string) {
  return useQuery<IGetPostCommentsOutputDto>({
    queryKey: postKeys.comments(postId),
    queryFn: () =>
      apiFetch<IGetPostCommentsOutputDto>(`/api/v1/posts/${postId}/comments`),
    staleTime: 30_000,
    enabled: !!postId,
  });
}

export function useTogglePrivacyMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    IUpdatePostOutputDto,
    Error,
    { postId: string; isPrivate: boolean }
  >({
    mutationFn: ({ postId, isPrivate }) =>
      apiFetch<IUpdatePostOutputDto>(`/api/v1/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

export function useToggleReactionMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation<ITogglePostReactionOutputDto, Error, { emoji: string }>({
    mutationFn: ({ emoji }) =>
      apiFetch<ITogglePostReactionOutputDto>(
        `/api/v1/posts/${postId}/reactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji }),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.reactions(postId) });
    },
  });
}

export function useAddCommentMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation<IPostCommentDto, Error, { content: string }>({
    mutationFn: ({ content }) =>
      apiFetch<IPostCommentDto>(`/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
  });
}

export function useDeleteCommentMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { commentId: string }>({
    mutationFn: ({ commentId }) =>
      apiFetch<void>(`/api/v1/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
  });
}

export function useUpdateCommentMutation(postId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    IPostCommentDto,
    Error,
    { commentId: string; content: string }
  >({
    mutationFn: ({ commentId, content }) =>
      apiFetch<IPostCommentDto>(
        `/api/v1/posts/${postId}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation<IDeletePostOutputDto, Error, { postId: string }>({
    mutationFn: ({ postId }) =>
      apiFetch<IDeletePostOutputDto>(`/api/v1/posts/${postId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
