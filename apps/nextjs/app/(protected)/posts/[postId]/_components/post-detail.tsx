"use client";

import { useCallback, useEffect, useState } from "react";
import type { IGetPostDetailOutputDto } from "@/application/dto/post/get-post-detail.dto";

export function PostDetail({ postId }: { postId: string }) {
  const [data, setData] = useState<IGetPostDetailOutputDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/posts/${postId}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Failed to load post");
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
  }, [fetchPost]);

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
        <a
          href="/posts"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back to posts
        </a>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <a
        href="/posts"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to posts
      </a>

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
      </div>
    </div>
  );
}
