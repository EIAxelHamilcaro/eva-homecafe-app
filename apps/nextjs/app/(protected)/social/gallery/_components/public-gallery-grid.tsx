"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Globe, Mountain, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useFeedGalleryQuery } from "@/app/(protected)/_hooks/use-feed-gallery";
import { useTogglePhotoPrivacyMutation } from "@/app/(protected)/_hooks/use-gallery";
import { useTogglePrivacyMutation } from "@/app/(protected)/_hooks/use-posts";

const TALL_POSITIONS = new Set([0, 5]);

function isTall(index: number): boolean {
  return TALL_POSITIONS.has(index % 6);
}

interface PublicGalleryGridProps {
  userId: string;
}

export function PublicGalleryGrid({ userId }: PublicGalleryGridProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useFeedGalleryQuery(page);
  const togglePostPrivacy = useTogglePrivacyMutation();
  const togglePhotoPrivacy = useTogglePhotoPrivacyMutation();
  const [bouncingIds, setBouncingIds] = useState<Set<string>>(new Set());

  function bounce(id: string) {
    setBouncingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setBouncingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 400);
  }

  function handleTogglePostPrivacy(e: React.MouseEvent, postId: string) {
    e.preventDefault();
    e.stopPropagation();
    bounce(postId);
    togglePostPrivacy.mutate({ postId, isPrivate: true });
  }

  function handleTogglePhotoPrivacy(e: React.MouseEvent, photoId: string) {
    e.preventDefault();
    e.stopPropagation();
    bounce(photoId);
    togglePhotoPrivacy.mutate({ photoId, isPrivate: true });
  }

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
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        <p>{error.message}</p>
      </div>
    );
  }

  if (!data || data.photos.length === 0) {
    return (
      <div className="rounded-xl bg-homecafe-beige/30 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-homecafe-beige">
          <Mountain className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="font-medium text-foreground">
          Aucune photo publique pour le moment
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Les photos des posts publics de toi et tes amis apparaîtront ici
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
        {data.photos.map((photo, index) => {
          const isOwn = photo.authorId === userId;
          const bounceKey = photo.postId ?? photo.photoId ?? "";
          const isBouncing = bouncingIds.has(bounceKey);

          const toggleButton = isOwn && (
            <button
              type="button"
              onClick={(e) =>
                photo.postId
                  ? handleTogglePostPrivacy(e, photo.postId)
                  : photo.photoId
                    ? handleTogglePhotoPrivacy(e, photo.photoId)
                    : undefined
              }
              title="Public — cliquer pour rendre privé"
              className={`absolute top-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white transition-all duration-300 hover:opacity-80 ${
                isBouncing ? "scale-125" : "scale-100"
              }`}
            >
              <span
                className={`transition-transform duration-300 ${isBouncing ? "rotate-[360deg]" : ""}`}
              >
                <Globe className="h-4 w-4" />
              </span>
            </button>
          );

          const content = (
            <>
              <Image
                src={photo.url}
                alt={`Photo de ${photo.authorName}`}
                fill
                className="object-cover transition-opacity group-hover:opacity-90"
                sizes="(max-width: 640px) 50vw, 33vw"
                unoptimized
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex items-center gap-1.5">
                  {photo.authorAvatar ? (
                    <Image
                      src={photo.authorAvatar}
                      alt=""
                      width={18}
                      height={18}
                      className="h-[18px] w-[18px] rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white/30">
                      <User className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-white">
                    {photo.authorName}
                  </span>
                </div>
              </div>
              {toggleButton}
            </>
          );

          const className = `group relative overflow-hidden rounded-xl bg-muted transition-transform hover:scale-[1.02] ${
            isTall(index) ? "row-span-2" : ""
          }`;

          return photo.postId ? (
            <Link
              key={`${photo.postId}-${photo.url}`}
              href={`/posts/${photo.postId}`}
              className={className}
            >
              {content}
            </Link>
          ) : (
            <div
              key={`standalone-${photo.photoId ?? index}-${photo.url}`}
              className={className}
            >
              {content}
            </div>
          );
        })}
      </div>

      {data.pagination.hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={isLoading}
          >
            Voir plus de photos
          </Button>
        </div>
      )}

      {page > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={!data.pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
