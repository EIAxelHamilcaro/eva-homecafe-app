"use client";

import Link from "next/link";
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

  return (
    <Link
      href={`/posts/${post.id}`}
      className="block rounded-lg border p-4 transition-colors hover:bg-accent"
    >
      <div className="mb-3 flex items-center gap-3">
        {post.author.avatarUrl ? (
          <img
            src={post.author.avatarUrl}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
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
            <img
              key={img}
              src={img}
              alt=""
              className="h-20 w-20 rounded object-cover"
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
        <span>{post.reactionCount} reactions</span>
      </div>
    </Link>
  );
}
