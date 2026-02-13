"use client";

import { Mountain } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type {
  GalleryPhotoDto,
  GetUserGalleryOutputDto,
} from "@/adapters/queries/gallery.query";
import { PhotoViewModal } from "./photo-view-modal";

const TALL_POSITIONS = new Set([0, 5]);

function isTall(index: number): boolean {
  return TALL_POSITIONS.has(index % 6);
}

export function GalleryGrid() {
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
        setError("Impossible de charger la galerie");
        return;
      }
      const json: GetUserGalleryOutputDto = await res.json();
      setData(json);
    } catch {
      setError("Impossible de charger la galerie");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery(page);
  }, [page, loadGallery]);

  const handleDelete = useCallback(async (photoId: string) => {
    const res = await fetch(`/api/v1/gallery/${photoId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || "Impossible de supprimer la photo");
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
  }, []);

  if (loading && !data) {
    return (
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        style={{ gridAutoRows: "8rem" }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className={`animate-pulse rounded-xl bg-muted ${isTall(i) ? "row-span-2" : ""}`}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 text-sm">
        <p>{error}</p>
        <button
          type="button"
          onClick={() => loadGallery(page)}
          className="mt-3 rounded-full bg-red-600 px-4 py-1.5 text-white text-xs hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!data || (data.photos.length === 0 && page === 1)) {
    return (
      <div className="rounded-xl bg-homecafe-beige/30 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-homecafe-beige">
          <Mountain className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="font-medium text-foreground">Ta galerie est vide</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajoute ta première photo pour commencer ta collection
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        style={{ gridAutoRows: "8rem" }}
      >
        {data.photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedPhoto(photo)}
            className={`group relative overflow-hidden rounded-xl bg-muted transition-transform hover:scale-[1.02] ${
              isTall(index) ? "row-span-2" : ""
            }`}
          >
            <Image
              src={photo.url}
              alt={photo.caption || photo.filename}
              fill
              className="object-cover transition-opacity group-hover:opacity-90"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data.pagination.hasPreviousPage || loading}
            className="rounded-full border px-4 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="text-sm text-muted-foreground">
            {data.pagination.page} / {data.pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.pagination.hasNextPage || loading}
            className="rounded-full border px-4 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Suivant
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
