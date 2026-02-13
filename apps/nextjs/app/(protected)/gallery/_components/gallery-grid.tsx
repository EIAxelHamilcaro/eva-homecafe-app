"use client";

import { Mountain } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { GalleryPhotoDto } from "@/adapters/queries/gallery.query";
import {
  useDeletePhotoMutation,
  useGalleryQuery,
} from "@/app/(protected)/_hooks/use-gallery";
import { PhotoViewModal } from "./photo-view-modal";

const TALL_POSITIONS = new Set([0, 5]);

function isTall(index: number): boolean {
  return TALL_POSITIONS.has(index % 6);
}

export function GalleryGrid() {
  const [page, setPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhotoDto | null>(
    null,
  );

  const { data, isLoading, error } = useGalleryQuery(page);
  const deletePhoto = useDeletePhotoMutation();

  const handleDelete = async (photoId: string) => {
    await deletePhoto.mutateAsync({ photoId });
    setSelectedPhoto(null);
  };

  if (isLoading && !data) {
    return (
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        style={{ gridAutoRows: "8rem" }}
      >
        {["s1", "s2", "s3", "s4", "s5", "s6"].map((id, i) => (
          <div
            key={id}
            className={`animate-pulse rounded-xl bg-muted ${isTall(i) ? "row-span-2" : ""}`}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700 text-sm">
        <p>{error.message}</p>
        <button
          type="button"
          onClick={() => setPage(page)}
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
            disabled={!data.pagination.hasPreviousPage || isLoading}
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
            disabled={!data.pagination.hasNextPage || isLoading}
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
