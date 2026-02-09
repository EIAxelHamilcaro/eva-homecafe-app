"use client";

import { useCallback, useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

interface GalleryUploadProps {
  onPhotoUploaded?: () => void;
}

export function GalleryUpload({ onPhotoUploaded }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryFile, setRetryFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setRetryFile(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only JPEG, PNG, GIF, and WebP images are accepted.");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError("File must be 10MB or smaller.");
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
          throw new Error(data.error || "Failed to get upload URL");
        }

        const { uploadUrl, fileUrl } = await presignedRes.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload file to storage");
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
          throw new Error(data.error || "Failed to add photo to gallery");
        }

        onPhotoUploaded?.();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Upload failed. Please try again.";
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
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-4 text-center transition-colors ${
            uploading
              ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
        >
          {uploading ? "Uploading..." : "Upload Photo"}
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          <span>{error}</span>
          {retryFile && (
            <button
              type="button"
              onClick={handleRetry}
              className="rounded bg-red-600 px-3 py-1 text-white text-xs hover:bg-red-700"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
