"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { Globe, Lock, Mountain, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  useGalleryQuery,
  useTogglePhotoPrivacyMutation,
} from "@/app/(protected)/_hooks/use-gallery";
import {
  GalleryUpload,
  type GalleryUploadHandle,
} from "@/app/(protected)/gallery/_components/gallery-upload";

interface JournalGalleryProps {
  userId: string;
}

export function JournalGallery(_props: JournalGalleryProps) {
  const uploadRef = useRef<GalleryUploadHandle>(null);
  const { data, isLoading } = useGalleryQuery(1);
  const togglePrivacy = useTogglePhotoPrivacyMutation();
  const [bouncingIds, setBouncingIds] = useState<Set<string>>(new Set());
  const photos = data?.photos.slice(0, 4) ?? [];

  function handleTogglePrivacy(
    e: React.MouseEvent,
    photoId: string,
    currentIsPrivate: boolean,
  ) {
    e.preventDefault();
    e.stopPropagation();

    setBouncingIds((prev) => new Set(prev).add(photoId));
    setTimeout(() => {
      setBouncingIds((prev) => {
        const next = new Set(prev);
        next.delete(photoId);
        return next;
      });
    }, 400);

    togglePrivacy.mutate({ photoId, isPrivate: !currentIsPrivate });
  }

  return (
    <Card className="border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Galerie</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tes plus belles photos, c&apos;est ici !
          </p>
        </div>
        <button
          type="button"
          onClick={() => uploadRef.current?.trigger()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="grid grid-cols-2 gap-2">
            {["a", "b", "c", "d"].map((key) => (
              <div
                key={key}
                className="flex aspect-square items-center justify-center rounded-md bg-homecafe-beige"
              >
                <Mountain className="h-6 w-6 text-muted-foreground/50" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && photos.length === 0 && (
          <div className="grid grid-cols-2 gap-2">
            {["a", "b", "c", "d"].map((key) => (
              <div
                key={key}
                className="flex aspect-square items-center justify-center rounded-md bg-homecafe-beige"
              >
                <Mountain className="h-6 w-6 text-muted-foreground/50" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo) => {
              const isBouncing = bouncingIds.has(photo.id);

              return (
                <div
                  key={photo.id}
                  className="relative aspect-square overflow-hidden rounded-md bg-muted"
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? photo.filename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 150px"
                  />
                  <button
                    type="button"
                    onClick={(e) =>
                      handleTogglePrivacy(e, photo.id, photo.isPrivate)
                    }
                    title={
                      photo.isPrivate
                        ? "Privé — cliquer pour rendre public"
                        : "Public — cliquer pour rendre privé"
                    }
                    className={`absolute top-1.5 right-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white transition-all duration-300 hover:opacity-80 ${
                      photo.isPrivate ? "bg-homecafe-blue" : "bg-emerald-500"
                    } ${isBouncing ? "scale-125" : "scale-100"}`}
                  >
                    <span
                      className={`transition-transform duration-300 ${isBouncing ? "rotate-[360deg]" : ""}`}
                    >
                      {photo.isPrivate ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Globe className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <Link
          href="/gallery"
          className="mt-4 inline-block rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
        >
          Voir plus
        </Link>

        <GalleryUpload ref={uploadRef} />
      </CardContent>
    </Card>
  );
}
