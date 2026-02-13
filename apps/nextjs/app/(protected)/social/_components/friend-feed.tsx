"use client";

import Link from "next/link";
import { useState } from "react";
import { useFriendFeedQuery } from "@/app/(protected)/_hooks/use-feed";
import { FeedPostCard } from "./feed-post-card";

export function FriendFeed() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useFriendFeedQuery(page);

  return (
    <div>
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
          {error.message}
        </div>
      )}

      {!isLoading && !error && data && !data.hasFriends && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="mb-2 text-lg font-medium text-muted-foreground">
            No posts in your feed yet
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            Add friends to see their posts! Share your friend code to get
            started.
          </p>
          <Link
            href="/profile"
            className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go to Profile
          </Link>
        </div>
      )}

      {!isLoading &&
        !error &&
        data &&
        data.hasFriends &&
        data.data.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="mb-2 text-lg font-medium text-muted-foreground">
              Your friends haven&apos;t posted anything yet
            </p>
            <p className="text-sm text-muted-foreground">
              Check back later to see what your friends are sharing!
            </p>
          </div>
        )}

      {!isLoading && !error && data && data.data.length > 0 && (
        <div className="space-y-4">
          {data.data.map((feedPost) => (
            <FeedPostCard key={feedPost.id} post={feedPost} />
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
      )}
    </div>
  );
}
