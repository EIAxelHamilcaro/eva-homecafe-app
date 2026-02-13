"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Card } from "@packages/ui/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import { useMoodboardsQuery } from "@/app/(protected)/_hooks/use-moodboard";
import { MoodboardDetail } from "./moodboard-detail";

export function MoodboardGrid() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading, error } = useMoodboardsQuery(page);

  if (selectedId) {
    return (
      <MoodboardDetail
        moodboardId={selectedId}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((key) => (
          <div key={key} className="h-48 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-destructive">{error.message}</p>
        <Button variant="outline" onClick={() => setPage(page)}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data || (data.moodboards.length === 0 && page === 1)) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="text-4xl">🎨</div>
        <h2 className="font-semibold text-lg">No moodboards yet</h2>
        <p className="text-muted-foreground">
          Create your first moodboard to start collecting visual inspiration!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.moodboards.map((board) => (
          <Card
            key={board.id}
            className="cursor-pointer p-4 transition-shadow hover:shadow-md"
            onClick={() => setSelectedId(board.id)}
          >
            <div className="mb-3 grid grid-cols-2 gap-1 overflow-hidden rounded-md">
              {board.previewPins.length > 0 ? (
                board.previewPins.map((pinPreview) => (
                  <div
                    key={pinPreview.id}
                    className="relative aspect-square overflow-hidden"
                  >
                    {pinPreview.type === "image" && pinPreview.imageUrl ? (
                      <Image
                        src={pinPreview.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          backgroundColor: pinPreview.color ?? "#e5e7eb",
                        }}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 flex aspect-video items-center justify-center rounded-md bg-muted">
                  <span className="text-2xl">🎨</span>
                </div>
              )}
            </div>
            <h3 className="truncate font-medium">{board.title}</h3>
            <p className="text-muted-foreground text-sm">
              {board.pinCount} {board.pinCount === 1 ? "pin" : "pins"}
            </p>
          </Card>
        ))}
      </div>

      {data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!data.pagination.hasPreviousPage}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!data.pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
