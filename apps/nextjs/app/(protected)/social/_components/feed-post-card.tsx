"use client";

import { Button } from "@packages/ui/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useToggleReactionMutation } from "@/app/(protected)/_hooks/use-posts";
import type { IFeedPostDto } from "@/application/dto/feed/get-friend-feed.dto";
import { stripHtml, truncate } from "@/common/utils/text";

function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "just now";
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

interface FeedPostCardProps {
  post: IFeedPostDto;
}

export function FeedPostCard({ post }: FeedPostCardProps) {
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
      className="block rounded-lg border p-4 transition-colors hover:bg-accent"
    >
      <div className="mb-3 flex items-center gap-3">
        {post.author.avatarUrl ? (
          <Image
            src={post.author.avatarUrl}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {getInitials(displayName)}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">{displayName}</p>
          <time className="text-xs text-muted-foreground">
            {formatRelativeDate(post.createdAt)}
          </time>
        </div>
      </div>

      <p className="mb-2 text-sm text-foreground">
        {truncate(stripHtml(post.content), 200)}
      </p>

      {post.images.length > 0 && (
        <div className="mb-2 flex gap-2">
          {post.images.slice(0, 3).map((img) => (
            <Image
              key={img}
              src={img}
              alt=""
              width={80}
              height={80}
              className="h-20 w-20 rounded object-cover"
              unoptimized
            />
          ))}
          {post.images.length > 3 && (
            <span className="flex h-20 w-20 items-center justify-center rounded bg-muted text-sm text-muted-foreground">
              +{post.images.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Button
          variant="ghost"
          onClick={handleReaction}
          disabled={toggleReaction.isPending}
          className={`flex items-center gap-1 rounded-full px-2 py-1 transition-colors ${
            hasReacted ? "bg-red-50 text-red-500" : "hover:bg-muted"
          }`}
        >
          <span>{hasReacted ? "❤️" : "🤍"}</span>
          <span>{reactionCount}</span>
        </Button>
      </div>
    </Link>
  );
}
