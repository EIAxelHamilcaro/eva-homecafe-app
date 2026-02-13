"use client";

import { Heart, Lock, MessageCircleMore } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { IGetFriendFeedOutputDto } from "@/application/dto/feed/get-friend-feed.dto";
import { stripHtml, truncate } from "@/common/utils/text";

function formatDateHeading(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}h${minutes}`;
}

interface FeedListProps {
  currentUserId: string;
}

export function FeedList({ currentUserId }: FeedListProps) {
  const [data, setData] = useState<IGetFriendFeedOutputDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchFeed = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/feed/unified?page=${currentPage}&limit=10`,
      );
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Impossible de charger le feed");
        return;
      }
      const json = (await res.json()) as IGetFriendFeedOutputDto;
      setData(json);
    } catch {
      setError("Impossible de charger le feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(page);
  }, [page, fetchFeed]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
        {error}
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="rounded-xl border-12 border-homecafe-green/20 p-8 text-center">
        <p className="mb-2 text-lg font-medium text-muted-foreground">
          Aucun post pour le moment
        </p>
        <p className="text-sm text-muted-foreground">
          Ajoute des amis pour voir leurs publications ici !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.data.map((feedPost) => {
        const isOwn = feedPost.author.id === currentUserId;
        const authorName = feedPost.author.displayName ?? feedPost.author.name;
        const authorAvatar = feedPost.author.avatarUrl;

        return (
          <Link
            key={feedPost.id}
            href={`/posts/${feedPost.id}`}
            className="relative block overflow-hidden rounded-lg border border-border bg-white transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3 px-6 pt-5">
              {authorAvatar ? (
                <Image
                  src={authorAvatar}
                  alt={authorName}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-homecafe-pink-light text-sm font-medium text-homecafe-pink">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{authorName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {formatDateHeading(feedPost.createdAt)}
                  {" · "}
                  {formatTime(feedPost.createdAt)}
                </p>
              </div>
              {isOwn && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-homecafe-blue text-white">
                  <Lock className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            <div className="px-6 pb-5 pt-3">
              <p className="text-sm text-foreground">
                {truncate(stripHtml(feedPost.content), 250)}
              </p>

              {feedPost.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {feedPost.images.slice(0, 3).map((img, index) => (
                    <div key={img} className="relative">
                      <Image
                        src={img}
                        alt=""
                        width={200}
                        height={200}
                        className="aspect-square w-full rounded-lg object-cover"
                        unoptimized
                      />
                      {index === 2 && feedPost.images.length > 3 && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 text-lg font-semibold text-white">
                          +{feedPost.images.length - 3}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-around rounded-b-lg bg-[#b77fff]/15 px-6 py-3">
              <span className="flex items-center gap-1.5">
                <Heart
                  className={`h-5 w-5 ${feedPost.hasReacted ? "fill-red-500 text-red-500" : "text-red-500"}`}
                />
                {feedPost.reactionCount > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {feedPost.reactionCount}
                  </span>
                )}
              </span>
              <MessageCircleMore className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
        );
      })}

      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            type="button"
            disabled={!data.pagination.hasPreviousPage}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            Précédent
          </button>
          <span className="text-sm text-muted-foreground">
            Page {data.pagination.page} / {data.pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={!data.pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
