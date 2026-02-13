"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { useUploadPhotoMutation } from "@/app/(protected)/_hooks/use-gallery";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export interface GalleryUploadHandle {
  trigger: () => void;
}

interface GalleryUploadProps {
  onPhotoUploaded?: () => void;
}

export const GalleryUpload = forwardRef<
  GalleryUploadHandle,
  GalleryUploadProps
>(function GalleryUpload({ onPhotoUploaded }, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadPhoto = useUploadPhotoMutation();

  useImperativeHandle(ref, () => ({
    trigger: () => inputRef.current?.click(),
  }));

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          return;
        }
        if (file.size > MAX_SIZE) {
          return;
        }
        uploadPhoto.mutate(file, {
          onSuccess: () => {
            onPhotoUploaded?.();
          },
        });
      }
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [uploadPhoto, onPhotoUploaded],
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={uploadPhoto.isPending}
        className="hidden"
      />

      {uploadPhoto.isPending && (
        <div className="flex items-center gap-3 rounded-xl bg-homecafe-beige/50 px-4 py-3 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-homecafe-pink border-t-transparent" />
          <span className="text-muted-foreground">Envoi en cours…</span>
        </div>
      )}

      {uploadPhoto.isError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          <span className="flex-1">{uploadPhoto.error.message}</span>
          <button
            type="button"
            onClick={() => uploadPhoto.reset()}
            className="shrink-0 rounded-full bg-red-600 px-3 py-1 text-white text-xs hover:bg-red-700"
          >
            Fermer
          </button>
        </div>
      )}
    </>
  );
});
