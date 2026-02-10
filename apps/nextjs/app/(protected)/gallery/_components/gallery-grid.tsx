"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type {
  GalleryPhotoDto,
  GetUserGalleryOutputDto,
} from "@/adapters/queries/gallery.query";
import { PhotoViewModal } from "./photo-view-modal";

interface GalleryGridProps {
  onPhotoDeleted?: () => void;
}

export function GalleryGrid({ onPhotoDeleted }: GalleryGridProps) {
  const [data, setData] = useState<GetUserGalleryOutputDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhotoDto | null>(
    null,
  );

  const loadGallery = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/gallery?page=${pageNum}&limit=20`);
      if (!res.ok) {
        setError("Failed to load gallery");
        return;
      }
      const json: GetUserGalleryOutputDto = await res.json();
      setData(json);
    } catch {
      setError("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery(page);
  }, [page, loadGallery]);

  const handleDelete = useCallback(
    async (photoId: string) => {
      const res = await fetch(`/api/v1/gallery/${photoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to delete photo");
      }

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          photos: prev.photos.filter((p) => p.id !== photoId),
          pagination: {
            ...prev.pagination,
            total: prev.pagination.total - 1,
          },
        };
      });

      setSelectedPhoto(null);
      onPhotoDeleted?.();
    },
    [onPhotoDeleted],
  );

  const handlePrevPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  if (loading && !data) {
    return (
      <div className="text-center text-gray-400 text-sm">
        Loading gallery...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700 text-sm">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => loadGallery(page)}
          className="mt-2 rounded bg-red-600 px-3 py-1 text-white text-xs hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || (data.photos.length === 0 && page === 1)) {
    return (
      <div className="rounded-lg border-2 border-dashed p-12 text-center text-gray-500">
        <p className="text-lg">Your gallery is empty</p>
        <p className="mt-2 text-sm">
          Upload your first photo to start your collection
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {data.photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedPhoto(photo)}
            className="aspect-square overflow-hidden rounded-lg border transition-opacity hover:opacity-80"
          >
            <Image
              src={photo.url}
              alt={photo.caption || photo.filename}
              width={160}
              height={160}
              className="h-full w-full object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>

      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={!data.pagination.hasPreviousPage || loading}
            className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600 text-sm">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={!data.pagination.hasNextPage || loading}
            className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {selectedPhoto && (
        <PhotoViewModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
