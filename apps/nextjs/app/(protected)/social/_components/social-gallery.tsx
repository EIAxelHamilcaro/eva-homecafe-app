"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { Globe, Mountain } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useFeedGalleryQuery } from "@/app/(protected)/_hooks/use-feed-gallery";
import { useTogglePhotoPrivacyMutation } from "@/app/(protected)/_hooks/use-gallery";
import { useTogglePrivacyMutation } from "@/app/(protected)/_hooks/use-posts";

interface SocialGalleryProps {
  userId: string;
}

function PlaceholderCell({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-md bg-homecafe-beige ${className ?? ""}`}
    >
      <Mountain className="h-6 w-6 text-muted-foreground/50" />
    </div>
  );
}

export function SocialGallery({ userId }: SocialGalleryProps) {
  const { data, isLoading } = useFeedGalleryQuery(1, 10);
  const togglePostPrivacy = useTogglePrivacyMutation();
  const togglePhotoPrivacy = useTogglePhotoPrivacyMutation();
  const [bouncingIds, setBouncingIds] = useState<Set<string>>(new Set());
  const photos = data?.photos ?? [];

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

  return (
    <Card className="rounded-lg border border-border/60">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Galerie</CardTitle>
        <p className="text-sm text-muted-foreground">
          Les photos publiques de toi et tes amis
        </p>
      </CardHeader>
      <CardContent className="max-h-[55vh] overflow-y-auto lg:h-[calc(100vh-26rem)] lg:max-h-none">
        {isLoading && (
          <div className="grid grid-cols-2 gap-2">
            <PlaceholderCell className="aspect-[4/3]" />
            <PlaceholderCell className="aspect-[4/3]" />
            <PlaceholderCell className="aspect-[4/3]" />
            <PlaceholderCell className="aspect-[4/3]" />
          </div>
        )}

        {!isLoading && photos.length === 0 && (
          <div className="grid grid-cols-2 gap-2">
            <PlaceholderCell className="aspect-[4/3]" />
            <PlaceholderCell className="aspect-[4/3]" />
            <PlaceholderCell className="aspect-[4/3]" />
            <PlaceholderCell className="aspect-[4/3]" />
          </div>
        )}

        {!isLoading && photos.length > 0 && (
          <div className="columns-2 gap-2 space-y-2">
            {photos.map((photo, index) => {
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
                  className={`absolute top-1.5 right-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white transition-all duration-300 hover:opacity-80 ${
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

              return photo.postId ? (
                <Link
                  key={`${photo.postId}-${photo.url}`}
                  href={`/posts/${photo.postId}`}
                  className="group relative block overflow-hidden rounded-md bg-muted break-inside-avoid"
                >
                  <Image
                    src={photo.url}
                    alt={`Photo de ${photo.authorName}`}
                    width={400}
                    height={300}
                    className="w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 280px"
                    unoptimized
                  />
                  {toggleButton}
                </Link>
              ) : (
                <div
                  key={`standalone-${photo.photoId ?? index}-${photo.url}`}
                  className="group relative block overflow-hidden rounded-md bg-muted break-inside-avoid"
                >
                  <Image
                    src={photo.url}
                    alt={`Photo de ${photo.authorName}`}
                    width={400}
                    height={300}
                    className="w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 280px"
                    unoptimized
                  />
                  {toggleButton}
                </div>
              );
            })}
          </div>
        )}
        {photos.length > 0 && (
          <Link
            href="/social/gallery"
            className="mt-4 inline-block rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            Voir plus
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
