"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Globe, Heart, Lock, MessageCircleMore } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { startTransition, useOptimistic, useState } from "react";
import {
  usePostsQuery,
  useTogglePrivacyMutation,
  useToggleReactionMutation,
} from "@/app/(protected)/_hooks/use-posts";
import type { IPostDto } from "@/application/dto/post/get-user-posts.dto";
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

function PostCard({ post }: { post: IPostDto }) {
  const togglePrivacy = useTogglePrivacyMutation();
  const toggleReaction = useToggleReactionMutation(post.id);
  const [reactionCount, setReactionCount] = useState(post.reactionCount);
  const [hasReacted, setHasReacted] = useState(post.hasReacted);
  const [optimisticPrivate, setOptimisticPrivate] = useOptimistic(
    post.isPrivate,
    (_current, next: boolean) => next,
  );
  const [isBouncing, setIsBouncing] = useState(false);

  function handleTogglePrivacy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const newValue = !optimisticPrivate;
    startTransition(() => {
      setOptimisticPrivate(newValue);
    });
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 400);
    togglePrivacy.mutate({ postId: post.id, isPrivate: newValue });
  }

  function handleReaction(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (toggleReaction.isPending) return;

    const prevCount = reactionCount;
    const prevReacted = hasReacted;

    setHasReacted(!hasReacted);
    setReactionCount(hasReacted ? reactionCount - 1 : reactionCount + 1);

    toggleReaction.mutate(
      { emoji: "❤️" },
      {
        onSuccess: (data) => {
          setHasReacted(data.action === "added");
          setReactionCount(
            data.action === "added"
              ? prevCount + (prevReacted ? 0 : 1)
              : prevCount - (prevReacted ? 1 : 0),
          );
        },
        onError: () => {
          setReactionCount(prevCount);
          setHasReacted(prevReacted);
        },
      },
    );
  }

  return (
    <Link
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
          onClick={handleTogglePrivacy}
          title={
            optimisticPrivate
              ? "Privé — cliquer pour rendre public"
              : "Public — cliquer pour rendre privé"
          }
          className={`absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition-all duration-300 hover:opacity-80 ${
            optimisticPrivate ? "bg-homecafe-blue" : "bg-emerald-500"
          } ${isBouncing ? "scale-125" : "scale-100"}`}
        >
          <span
            className={`transition-transform duration-300 ${isBouncing ? "rotate-[360deg]" : ""}`}
          >
            {optimisticPrivate ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </span>
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

      <div className="flex items-center justify-around rounded-b-lg bg-[#b77fff]/15 px-6 py-3">
        <Button
          variant="ghost"
          onClick={handleReaction}
          disabled={toggleReaction.isPending}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
            hasReacted
              ? "bg-red-50 text-red-500 hover:bg-red-100"
              : "text-muted-foreground hover:bg-white/50"
          }`}
        >
          <Heart
            className={`h-5 w-5 ${hasReacted ? "fill-red-500 text-red-500" : ""}`}
          />
          <span>{reactionCount}</span>
        </Button>

        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MessageCircleMore className="h-5 w-5" />
          <span>{post.commentCount}</span>
        </span>
      </div>
    </Link>
  );
}

export function PostsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = usePostsQuery(page);

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
        <PostCard key={post.id} post={post} />
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
