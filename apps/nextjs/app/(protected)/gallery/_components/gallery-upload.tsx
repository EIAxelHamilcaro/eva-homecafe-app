"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryPhotoDto } from "@/adapters/queries/gallery.query";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export function GalleryUpload() {
  const [photos, setPhotos] = useState<GalleryPhotoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryFile, setRetryFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await fetch("/api/v1/gallery");
        if (res.ok) {
          const data = await res.json();
          setPhotos(data.photos);
        }
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const uploadFile = useCallback(async (file: File) => {
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

      const photo: GalleryPhotoDto = await addRes.json();
      setPhotos((prev) => [photo, ...prev]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(message);
      setRetryFile(file);
    } finally {
      setUploading(false);
    }
  }, []);

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
    <div className="space-y-6">
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

      {loading && (
        <div className="text-center text-gray-400 text-sm">Loading...</div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-square overflow-hidden rounded-lg border"
            >
              <img
                src={photo.url}
                alt={photo.filename}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && !uploading && !error && !loading && (
        <div className="rounded-lg border-2 border-dashed p-12 text-center text-gray-500">
          <p className="text-lg">Your gallery is empty</p>
          <p className="mt-2 text-sm">
            Upload your first photo to start your collection
          </p>
        </div>
      )}
    </div>
  );
}
