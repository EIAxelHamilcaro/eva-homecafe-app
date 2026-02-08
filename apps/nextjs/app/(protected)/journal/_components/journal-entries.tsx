"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { IGetJournalEntriesOutputDto } from "@/application/dto/journal/get-journal-entries.dto";
import { stripHtml, truncate } from "@/common/utils/text";
import { DateNavigator } from "./date-navigator";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function formatDateHeading(dateStr: string): string {
  if (!DATE_REGEX.test(dateStr)) return dateStr;
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function JournalEntries() {
  const [data, setData] = useState<IGetJournalEntriesOutputDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<string | undefined>(undefined);

  const fetchEntries = useCallback(
    async (currentPage: number, date?: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("limit", "20");
        if (date) params.set("date", date);

        const res = await fetch(`/api/v1/journal?${params.toString()}`);
        if (!res.ok) {
          try {
            const err = (await res.json()) as { error?: string };
            setError(err.error ?? "Failed to load journal entries");
          } catch {
            setError("Failed to load journal entries");
          }
          return;
        }
        const json = (await res.json()) as IGetJournalEntriesOutputDto;
        setData(json);
      } catch {
        setError("Failed to load journal entries");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchEntries(page, dateFilter);
  }, [page, dateFilter, fetchEntries]);

  const handleDateChange = (date: string | undefined) => {
    setDateFilter(date);
    setPage(1);
  };

  return (
    <div>
      <DateNavigator value={dateFilter} onChange={handleDateChange} />

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && (!data || data.groups.length === 0) && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="mb-2 text-lg font-medium text-muted-foreground">
            {dateFilter ? "No entries for this date" : "No journal entries yet"}
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            {dateFilter
              ? "Try selecting a different date or clear the filter."
              : "Start writing your first journal entry to begin your journey."}
          </p>
          {!dateFilter && (
            <Link
              href="/posts/new"
              className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Write your first entry
            </Link>
          )}
        </div>
      )}

      {!loading && !error && data && data.groups.length > 0 && (
        <div className="space-y-6">
          {data.groups.map((group) => (
            <div key={group.date}>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {formatDateHeading(group.date)}
              </h2>
              <div className="space-y-3">
                {group.posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-accent"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        Journal
                      </span>
                      <time className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleTimeString(
                          undefined,
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </time>
                    </div>

                    <p className="mb-2 text-sm text-foreground">
                      {truncate(stripHtml(post.content), 150)}
                    </p>

                    {post.images.length > 0 && (
                      <div className="flex gap-2">
                        {post.images.slice(0, 3).map((img) => (
                          <img
                            key={img}
                            src={img}
                            alt=""
                            className="h-16 w-16 rounded object-cover"
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
              </div>
            </div>
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
