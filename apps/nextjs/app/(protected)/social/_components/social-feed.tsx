"use client";

import { Button } from "@packages/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { Globe, Heart, Maximize2, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useUnifiedFeedQuery } from "@/app/(protected)/_hooks/use-feed";
import {
  useTogglePrivacyMutation,
  useToggleReactionMutation,
} from "@/app/(protected)/_hooks/use-posts";
import type { IFeedPostDto } from "@/application/dto/feed/get-friend-feed.dto";
import { stripHtml, truncate } from "@/common/utils/text";

function formatDateHeading(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
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

function FeedPostCard({
  post,
  isOwn,
  onTogglePrivacy,
  isBouncing,
}: {
  post: IFeedPostDto;
  isOwn: boolean;
  onTogglePrivacy: (e: React.MouseEvent, postId: string) => void;
  isBouncing: boolean;
}) {
  const displayName = post.author.displayName ?? post.author.name;
  const [reactionCount, setReactionCount] = useState(post.reactionCount);
  const [hasReacted, setHasReacted] = useState(post.hasReacted);
  const toggleReaction = useToggleReactionMutation(post.id);

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
      className="block rounded-xl border-12 border-homecafe-green/20 p-4 transition-all duration-200 hover:scale-[1.02] hover:border-homecafe-green/40 hover:shadow-lg hover:shadow-homecafe-green/15"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-base font-semibold capitalize">
          {formatDateHeading(post.createdAt)}
        </span>
        <div className="flex items-center gap-1.5">
          {isOwn && (
            <Button
              onClick={(e) => onTogglePrivacy(e, post.id)}
              title="Public — cliquer pour rendre privé"
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-emerald-500 text-white transition-all duration-300 hover:opacity-80 ${
                isBouncing ? "scale-125" : "scale-100"
              }`}
            >
              <span
                className={`transition-transform duration-300 ${isBouncing ? "rotate-[360deg]" : ""}`}
              >
                <Globe className="h-4 w-4" />
              </span>
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleReaction}
            disabled={toggleReaction.isPending}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              hasReacted
                ? "bg-red-50 text-red-500"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Heart className={`h-4 w-4 ${hasReacted ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2">
        {post.author.avatarUrl ? (
          <Image
            src={post.author.avatarUrl}
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-homecafe-pink-light">
            <User className="h-3 w-3 text-homecafe-pink" />
          </div>
        )}
        <span className="text-xs text-muted-foreground">{displayName}</span>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">
          {formatTime(post.createdAt)}
        </span>
        {reactionCount > 0 && (
          <>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {reactionCount} ❤️
            </span>
          </>
        )}
      </div>

      <div className="flex gap-3">
        <p className="flex-1 text-sm text-foreground">
          {truncate(stripHtml(post.content), 150)}
        </p>
        {post.images.length > 0 && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={post.images[0] as string}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
              unoptimized
            />
          </div>
        )}
      </div>
    </Link>
  );
}

interface SocialFeedProps {
  userId: string;
}

export function SocialFeed({ userId }: SocialFeedProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useUnifiedFeedQuery(page);
  const togglePrivacy = useTogglePrivacyMutation();
  const [bouncingIds, setBouncingIds] = useState<Set<string>>(new Set());

  function handleTogglePrivacy(e: React.MouseEvent, postId: string) {
    e.preventDefault();
    e.stopPropagation();

    setBouncingIds((prev) => new Set(prev).add(postId));
    setTimeout(() => {
      setBouncingIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }, 400);

    togglePrivacy.mutate({ postId, isPrivate: true });
  }

  return (
    <Card className="h-full rounded-lg border border-border/60">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">
            Derniers posts publics
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tes posts et ceux de tes amis
          </p>
        </div>
        <Link
          href="/feed"
          title="Voir tous les posts"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Maximize2 className="h-4 w-4" />
        </Link>
      </CardHeader>

      <CardContent className="max-h-[55vh] overflow-y-auto lg:h-[calc(100vh-26rem)] lg:max-h-none">
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
            {error.message}
          </div>
        )}

        {!isLoading && !error && data && data.data.length === 0 && (
          <div className="rounded-xl border-12 border-homecafe-green/20 p-8 text-center">
            <p className="mb-2 text-sm text-muted-foreground">
              {data.hasFriends
                ? "Aucun post public pour le moment"
                : "Ajoute des amis pour voir leurs posts ici !"}
            </p>
            {!data.hasFriends && (
              <Link
                href="/profile"
                className="inline-block rounded-full bg-homecafe-pink px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Mon profil
              </Link>
            )}
          </div>
        )}

        {!isLoading && !error && data && data.data.length > 0 && (
          <div className="space-y-3">
            {data.data.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                isOwn={post.author.id === userId}
                onTogglePrivacy={handleTogglePrivacy}
                isBouncing={bouncingIds.has(post.id)}
              />
            ))}

            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.pagination.hasPreviousPage}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground">
                  {data.pagination.page} / {data.pagination.totalPages}
                </span>
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
        )}
      </CardContent>
    </Card>
  );
}
