import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Post } from "@/types/post";
import { api } from "../client";
import { feedGalleryKeys, feedKeys, journalKeys, postKeys } from "./query-keys";

export function useTogglePostPrivacy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      isPrivate,
    }: {
      postId: string;
      isPrivate: boolean;
    }) => api.patch<Post>(`/api/v1/posts/${postId}`, { isPrivate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      queryClient.invalidateQueries({ queryKey: journalKeys.all });
      queryClient.invalidateQueries({ queryKey: feedGalleryKeys.all });
      queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}
