"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { IGetPostReactionsOutputDto } from "@/adapters/queries/post-reactions.query";
import type { IGetPostDetailOutputDto } from "@/application/dto/post/get-post-detail.dto";
import { POST_REACTION_EMOJIS } from "@/domain/post/value-objects/post-reaction-type.vo";

function groupReactionsByEmoji(
  reactions: IGetPostReactionsOutputDto["reactions"],
): { emoji: string; names: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const r of reactions) {
    const name = r.displayName ?? r.userName;
    const existing = groups.get(r.emoji);
    if (existing) {
      existing.push(name);
    } else {
      groups.set(r.emoji, [name]);
    }
  }
  return Array.from(groups.entries()).map(([emoji, names]) => ({
    emoji,
    names,
  }));
}

export function PostDetail({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<IGetPostDetailOutputDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reactions, setReactions] = useState<IGetPostReactionsOutputDto | null>(
    null,
  );
  const [togglingEmoji, setTogglingEmoji] = useState<string | null>(null);

  const fetchReactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/posts/${postId}/reactions`);
      if (res.ok) {
        const json = (await res.json()) as IGetPostReactionsOutputDto;
        setReactions(json);
      }
    } catch {}
  }, [postId]);

  const handleToggleReaction = async (emoji: string) => {
    if (togglingEmoji) return;
    setTogglingEmoji(emoji);
    try {
      const res = await fetch(`/api/v1/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      if (res.ok) {
        await fetchReactions();
      }
    } catch {
    } finally {
      setTogglingEmoji(null);
    }
  };

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/posts/${postId}`);
      if (!res.ok) {
        let errMsg = "Failed to load post";
        try {
          const err = await res.json();
          errMsg = err.error ?? errMsg;
        } catch {}
        setError(errMsg);
        return;
      }
      const json = (await res.json()) as IGetPostDetailOutputDto;
      setData(json);
    } catch {
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
    fetchReactions();
  }, [fetchPost, fetchReactions]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/posts/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let errMsg = "Failed to delete post";
        try {
          const err = await res.json();
          errMsg = err.error ?? errMsg;
        } catch {}
        setError(errMsg);
        setDeleting(false);
        setShowDeleteConfirm(false);
        return;
      }
      router.push(data?.isPrivate ? "/journal" : "/posts");
    } catch {
      setError("Failed to delete post");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          href="/posts"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to posts
        </Link>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const isOwner = data.userId === currentUserId;

  return (
    <div className="space-y-4">
      <Link
        href="/posts"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to posts
      </Link>

      <div className="rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              data.isPrivate
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            }`}
          >
            {data.isPrivate ? "Private" : "Public"}
          </span>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <time>{new Date(data.createdAt).toLocaleDateString()}</time>
            {data.updatedAt && (
              <span>
                (edited {new Date(data.updatedAt).toLocaleDateString()})
              </span>
            )}
          </div>
        </div>

        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />

        {data.images.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {data.images.map((img) => (
              <img
                key={img}
                src={img}
                alt=""
                className="w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {!data.isPrivate && (
          <div className="mt-6 border-t pt-4">
            <div className="flex flex-wrap gap-2">
              {POST_REACTION_EMOJIS.map((emoji) => {
                const emojiReactions =
                  reactions?.reactions.filter((r) => r.emoji === emoji) ?? [];
                const hasReacted = emojiReactions.some(
                  (r) => r.userId === currentUserId,
                );
                const count = emojiReactions.length;

                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleToggleReaction(emoji)}
                    disabled={togglingEmoji !== null}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-colors ${
                      hasReacted
                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "bg-muted hover:bg-muted/80"
                    } ${count === 0 && !hasReacted ? "opacity-60" : ""}`}
                  >
                    <span>{emoji}</span>
                    {count > 0 && (
                      <span className="text-xs font-medium">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {reactions && reactions.totalCount > 0 && (
              <div className="mt-3 flex flex-wrap gap-1 text-xs text-muted-foreground">
                {groupReactionsByEmoji(reactions.reactions).map(
                  ({ emoji, names }) => (
                    <span key={emoji}>
                      {emoji} {names.join(", ")}
                    </span>
                  ),
                )}
              </div>
            )}
          </div>
        )}

        {isOwner && (
          <div className="mt-6 flex gap-3 border-t pt-4">
            <Link
              href={`/posts/${postId}/edit`}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="mb-3 text-sm text-red-800 dark:text-red-200">
            Are you sure you want to delete this post? This action cannot be
            undone.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
