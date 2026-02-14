"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Heart, Lock, MessageCircleMore, Unlock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  usePostsQuery,
  useTogglePrivacyMutation,
} from "@/app/(protected)/_hooks/use-posts";
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

export function PostsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = usePostsQuery(page);
  const togglePrivacy = useTogglePrivacyMutation();

  function handleTogglePrivacy(
    e: React.MouseEvent,
    postId: string,
    currentIsPrivate: boolean,
  ) {
    e.preventDefault();
    e.stopPropagation();
    togglePrivacy.mutate({ postId, isPrivate: !currentIsPrivate });
  }

  if (isLoading) {
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
        {error.message}
      </div>
    );
  }

  if (!data || data.posts.length === 0) {
    return (
      <div className="rounded-xl border-12 border-homecafe-green/20 p-8 text-center">
        <p className="mb-2 text-lg font-medium text-muted-foreground">
          Aucun post pour le moment
        </p>
        <Link
          href="/posts/new"
          className="mt-4 inline-flex rounded-full bg-homecafe-pink px-6 py-2 text-sm font-medium text-white"
        >
          Créer ton premier post
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="relative block overflow-hidden rounded-lg border border-border bg-white transition-all duration-200 hover:shadow-md"
        >
          <div className="relative p-6 pb-0">
            <div className="pr-10">
              <h3 className="text-xl font-bold capitalize">
                {formatDateHeading(post.createdAt)}
              </h3>
              <time className="mt-0.5 block text-sm text-muted-foreground">
                {formatTime(post.createdAt)}
              </time>
            </div>

            <Button
              onClick={(e) => handleTogglePrivacy(e, post.id, post.isPrivate)}
              title={
                post.isPrivate
                  ? "Privé — cliquer pour rendre public"
                  : "Public — cliquer pour rendre privé"
              }
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-homecafe-blue text-white transition-opacity hover:opacity-80"
            >
              {post.isPrivate ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="px-6 pb-6 pt-3">
            <p className="text-base text-foreground">
              {truncate(stripHtml(post.content), 200)}
            </p>

            {post.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {post.images.slice(0, 3).map((img, index) => (
                  <div key={img} className="relative">
                    <Image
                      src={img}
                      alt=""
                      width={200}
                      height={200}
                      className="aspect-square w-full rounded-lg object-cover"
                      unoptimized
                    />
                    {index === 2 && post.images.length > 3 && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 text-lg font-semibold text-white">
                        +{post.images.length - 3}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-around rounded-b-lg bg-[#b77fff]/15 px-6 py-3">
              <span className="flex items-center gap-1.5">
                <Heart className="h-5 w-5 text-red-500" />
              </span>
              <MessageCircleMore className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </Link>
      ))}

      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            disabled={!data.pagination.hasPreviousPage}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.pagination.page} / {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!data.pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
