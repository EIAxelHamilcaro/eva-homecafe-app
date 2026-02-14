import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { feedGalleryKeys, galleryKeys } from "./query-keys";

export function useTogglePhotoPrivacy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      photoId,
      isPrivate,
    }: {
      photoId: string;
      isPrivate: boolean;
    }) =>
      api.patch<{ id: string; isPrivate: boolean }>(
        `/api/v1/gallery/${photoId}`,
        { isPrivate },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      queryClient.invalidateQueries({ queryKey: feedGalleryKeys.all });
    },
  });
}
