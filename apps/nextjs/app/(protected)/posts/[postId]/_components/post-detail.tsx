"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { IGetPostDetailOutputDto } from "@/application/dto/post/get-post-detail.dto";

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
  }, [fetchPost]);

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
