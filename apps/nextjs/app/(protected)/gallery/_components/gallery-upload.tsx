"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryFile, setRetryFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    trigger: () => inputRef.current?.click(),
  }));

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setRetryFile(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Seuls les formats JPEG, PNG, GIF et WebP sont acceptés.");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError("Le fichier ne doit pas dépasser 10 Mo.");
        return;
      }

      setUploading(true);

      try {
        const presignedRes = await fetch("/api/v1/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: "gallery",
            filename: file.name,
            mimeType: file.type,
            size: file.size,
          }),
        });

        if (!presignedRes.ok) {
          const data = await presignedRes.json();
          throw new Error(
            data.error || "Impossible d\u2019obtenir l\u2019URL d\u2019upload",
          );
        }

        const { uploadUrl, fileUrl } = await presignedRes.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadRes.ok) {
          throw new Error("Échec de l\u2019envoi du fichier");
        }

        const addRes = await fetch("/api/v1/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: fileUrl,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
          }),
        });

        if (!addRes.ok) {
          const data = await addRes.json();
          throw new Error(data.error || "Impossible d\u2019ajouter la photo");
        }

        onPhotoUploaded?.();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "L\u2019upload a échoué. Réessaie.";
        setError(message);
        setRetryFile(file);
      } finally {
        setUploading(false);
      }
    },
    [onPhotoUploaded],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [uploadFile],
  );

  const handleRetry = useCallback(() => {
    if (retryFile) {
      uploadFile(retryFile);
    }
  }, [retryFile, uploadFile]);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      {uploading && (
        <div className="flex items-center gap-3 rounded-xl bg-homecafe-beige/50 px-4 py-3 text-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-homecafe-pink border-t-transparent" />
          <span className="text-muted-foreground">Envoi en cours…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          <span className="flex-1">{error}</span>
          {retryFile && (
            <button
              type="button"
              onClick={handleRetry}
              className="shrink-0 rounded-full bg-red-600 px-3 py-1 text-white text-xs hover:bg-red-700"
            >
              Réessayer
            </button>
          )}
        </div>
      )}
    </>
  );
});
