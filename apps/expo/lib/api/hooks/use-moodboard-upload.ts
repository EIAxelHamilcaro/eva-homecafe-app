import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImagePickerAsset } from "expo-image-picker";
import { useEffect, useRef, useState } from "react";

import type { AddPinOutput, PresignedUploadResponse } from "@/types/moodboard";
import { api } from "../client";
import {
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE,
  uploadToPresignedUrl,
} from "../upload-utils";
import { moodboardKeys } from "./query-keys";

export function useMoodboardUpload(moodboardId: string) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  useEffect(() => {
    return () => {
      xhrRef.current?.abort();
    };
  }, []);

  const mutation = useMutation({
    mutationFn: async (asset: ImagePickerAsset) => {
      const filename = asset.fileName ?? `pin_${Date.now()}.jpg`;
      const mimeType = asset.mimeType ?? "image/jpeg";
      const size = asset.fileSize ?? 0;

      if (size <= 0) {
        throw new Error("Impossible de déterminer la taille du fichier");
      }

      if (size > MAX_FILE_SIZE) {
        throw new Error("L'image dépasse la taille maximale de 10 Mo");
      }

      if (!ACCEPTED_MIME_TYPES.includes(mimeType)) {
        throw new Error(
          "Format non supporté. Formats acceptés : JPEG, PNG, GIF, WebP",
        );
      }

      setProgress(0);

      const presigned = await api.post<PresignedUploadResponse>(
        "/api/v1/upload",
        {
          context: "moodboard",
          filename,
          mimeType,
          size,
        },
      );

      await uploadToPresignedUrl(
        presigned.uploadUrl,
        asset.uri,
        mimeType,
        setProgress,
        xhrRef,
      );

      return api.post<AddPinOutput>(`/api/v1/moodboards/${moodboardId}/pins`, {
        type: "image" as const,
        imageUrl: presigned.fileUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.all });
      queryClient.invalidateQueries({
        queryKey: moodboardKeys.detail(moodboardId),
      });
      setProgress(0);
    },
    onError: () => {
      setProgress(0);
    },
  });

  const cancel = () => {
    xhrRef.current?.abort();
  };

  return { ...mutation, progress, cancel };
}
