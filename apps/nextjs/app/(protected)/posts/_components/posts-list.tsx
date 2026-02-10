"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { IGetUserPostsOutputDto } from "@/application/dto/post/get-user-posts.dto";
import { stripHtml, truncate } from "@/common/utils/text";

export function PostsList() {
  const [data, setData] = useState<IGetUserPostsOutputDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/posts?page=${currentPage}&limit=20`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Failed to load posts");
        return;
      }
      const json = (await res.json()) as IGetUserPostsOutputDto;
      setData(json);
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(page);
  }, [page, fetchPosts]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
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

  if (!data || data.posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="mb-2 text-lg font-medium text-muted-foreground">
          No posts yet
        </p>
        <p className="mb-4 text-sm text-muted-foreground">
          Create your first post to start your journal or share with friends.
        </p>
        <Link
          href="/posts/new"
          className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create your first post
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
          className="block rounded-lg border p-4 transition-colors hover:bg-accent"
        >
          <div className="mb-2 flex items-center justify-between">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                post.isPrivate
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              {post.isPrivate ? "Private" : "Public"}
            </span>
            <time className="text-xs text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString()}
            </time>
          </div>

          <p className="mb-2 text-sm text-foreground">
            {truncate(stripHtml(post.content), 150)}
          </p>

          {post.images.length > 0 && (
            <div className="flex gap-2">
              {post.images.slice(0, 3).map((img) => (
                <Image
                  key={img}
                  src={img}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded object-cover"
                  unoptimized
                />
              ))}
              {post.images.length > 3 && (
                <span className="flex h-16 w-16 items-center justify-center rounded bg-muted text-sm text-muted-foreground">
                  +{post.images.length - 3}
                </span>
              )}
            </div>
          )}
        </Link>
      ))}

      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            type="button"
            disabled={!data.pagination.hasPreviousPage}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={!data.pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
