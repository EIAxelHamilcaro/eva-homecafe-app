"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Globe, Lock, Mountain } from "lucide-react";
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
        <Button
          onClick={() => setPage(page)}
          className="mt-3 rounded-full bg-red-600 px-4 py-1.5 text-white text-xs hover:bg-red-700"
        >
          Réessayer
        </Button>
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
            type="button"
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className={`group relative cursor-pointer overflow-hidden rounded-xl bg-muted transition-transform hover:scale-[1.02] ${
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
            <div
              className={`absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full text-white ${
                photo.isPrivate ? "bg-muted-foreground/60" : "bg-emerald-500"
              }`}
            >
              {photo.isPrivate ? (
                <Lock className="h-3 w-3" />
              ) : (
                <Globe className="h-3 w-3" />
              )}
            </div>
          </button>
        ))}
      </div>

      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data.pagination.hasPreviousPage || isLoading}
            className="rounded-full border px-4 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            {data.pagination.page} / {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.pagination.hasNextPage || isLoading}
            className="rounded-full border px-4 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Suivant
          </Button>
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
