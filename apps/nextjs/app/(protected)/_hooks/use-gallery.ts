"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetUserGalleryOutputDto } from "@/adapters/queries/gallery.query";
import type { IAddPhotoOutputDto } from "@/application/dto/gallery/add-photo.dto";
import type { IDeletePhotoOutputDto } from "@/application/dto/gallery/delete-photo.dto";
import type { IGenerateUploadUrlOutputDto } from "@/application/dto/upload/generate-upload-url.dto";
import { apiFetch } from "@/common/api";

export const galleryKeys = {
  all: ["gallery"] as const,
  list: (page: number) => ["gallery", "list", page] as const,
};

export function useGalleryQuery(page: number) {
  return useQuery<GetUserGalleryOutputDto>({
    queryKey: galleryKeys.list(page),
    queryFn: () =>
      apiFetch<GetUserGalleryOutputDto>(
        `/api/v1/gallery?page=${page}&limit=20`,
      ),
    staleTime: 30_000,
  });
}

export function useDeletePhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation<IDeletePhotoOutputDto, Error, { photoId: string }>({
    mutationFn: ({ photoId }) =>
      apiFetch<IDeletePhotoOutputDto>(`/api/v1/gallery/${photoId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}

export function useTogglePhotoPrivacyMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; isPrivate: boolean },
    Error,
    { photoId: string; isPrivate: boolean }
  >({
    mutationFn: ({ photoId, isPrivate }) =>
      apiFetch<{ id: string; isPrivate: boolean }>(
        `/api/v1/gallery/${photoId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPrivate }),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["feed-gallery"] });
    },
  });
}

interface UploadPhotoInput {
  file: File;
  isPrivate: boolean;
}

export function useUploadPhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation<IAddPhotoOutputDto, Error, UploadPhotoInput>({
    mutationFn: async ({ file, isPrivate }: UploadPhotoInput) => {
      const presign = await apiFetch<IGenerateUploadUrlOutputDto>(
        "/api/v1/upload",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: "gallery",
            filename: file.name,
            mimeType: file.type,
            size: file.size,
          }),
        },
      );

      await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      return apiFetch<IAddPhotoOutputDto>("/api/v1/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: presign.fileUrl,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          isPrivate,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}
