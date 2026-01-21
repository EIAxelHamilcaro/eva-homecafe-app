import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { UploadMediaResponse } from "@/constants/chat";
import { api } from "../client";

export interface ImageAsset {
  uri: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

export interface UseMediaUploadOptions {
  onProgress?: (progress: number) => void;
}

export function useMediaUpload(options?: UseMediaUploadOptions) {
  const [progress, setProgress] = useState(0);

  const handleProgress = (p: number) => {
    setProgress(p);
    options?.onProgress?.(p);
  };

  const mutation = useMutation({
    mutationFn: async (asset: ImageAsset) => {
      setProgress(0);

      const formData = new FormData();

      const fileExtension = asset.uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const mimeType = asset.type ?? getMimeTypeFromExtension(fileExtension);
      const fileName = asset.fileName ?? `image_${Date.now()}.${fileExtension}`;

      formData.append("file", {
        uri: asset.uri,
        type: mimeType,
        name: fileName,
      } as unknown as Blob);

      return api.uploadFile<UploadMediaResponse>(
        "/api/v1/chat/upload",
        formData,
        handleProgress,
      );
    },
    onSettled: () => {
      setProgress(0);
    },
  });

  return {
    ...mutation,
    progress,
  };
}

function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return mimeTypes[extension] ?? "image/jpeg";
}

export interface UseMultipleMediaUploadOptions {
  onProgress?: (progress: number) => void;
  onFileProgress?: (index: number, progress: number) => void;
}

export function useMultipleMediaUpload(
  options?: UseMultipleMediaUploadOptions,
) {
  const [progress, setProgress] = useState(0);
  const [fileProgresses, setFileProgresses] = useState<number[]>([]);

  const mutation = useMutation({
    mutationFn: async (assets: ImageAsset[]) => {
      setProgress(0);
      setFileProgresses(new Array(assets.length).fill(0));

      const results: UploadMediaResponse[] = [];
      let totalProgress = 0;
      let currentIndex = 0;

      for (const asset of assets) {
        const index = currentIndex;

        const formData = new FormData();
        const fileExtension =
          asset.uri.split(".").pop()?.toLowerCase() ?? "jpg";
        const mimeType = asset.type ?? getMimeTypeFromExtension(fileExtension);
        const fileName =
          asset.fileName ?? `image_${Date.now()}_${index}.${fileExtension}`;

        formData.append("file", {
          uri: asset.uri,
          type: mimeType,
          name: fileName,
        } as unknown as Blob);

        const result = await api.uploadFile<UploadMediaResponse>(
          "/api/v1/chat/upload",
          formData,
          (p) => {
            setFileProgresses((prev) => {
              const newProgresses = [...prev];
              newProgresses[index] = p;
              return newProgresses;
            });
            options?.onFileProgress?.(index, p);

            const completedProgress = (index / assets.length) * 100;
            const currentFileProgress = p / assets.length;
            totalProgress = completedProgress + currentFileProgress;
            setProgress(Math.round(totalProgress));
            options?.onProgress?.(Math.round(totalProgress));
          },
        );

        results.push(result);
        currentIndex++;
      }

      setProgress(100);
      options?.onProgress?.(100);

      return results;
    },
    onSettled: () => {
      setProgress(0);
      setFileProgresses([]);
    },
  });

  return {
    ...mutation,
    progress,
    fileProgresses,
  };
}
