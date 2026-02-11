import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImagePickerAsset } from "expo-image-picker";
import { useEffect, useRef, useState } from "react";

import type { PhotoDto, PresignedUploadResponse } from "@/types/gallery";
import { api } from "../client";
import {
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE,
  uploadToPresignedUrl,
} from "../upload-utils";
import { galleryKeys } from "./query-keys";

export function useGalleryUpload() {
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
      const filename = asset.fileName ?? `photo_${Date.now()}.jpg`;
      const mimeType = asset.mimeType ?? "image/jpeg";
      const size = asset.fileSize ?? 0;

      if (size <= 0) {
        throw new Error("Impossible de déterminer la taille du fichier");
      }

      if (size > MAX_FILE_SIZE) {
        throw new Error("La photo dépasse la taille maximale de 10 Mo");
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
          context: "gallery",
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

      return api.post<PhotoDto>("/api/v1/gallery", {
        url: presigned.fileUrl,
        filename,
        mimeType,
        size,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
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
