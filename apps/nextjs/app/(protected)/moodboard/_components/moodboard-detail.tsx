"use client";

import { Button } from "@packages/ui/components/ui/button";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AddPinDialog } from "./add-pin-dialog";
import { DeleteMoodboardDialog } from "./delete-moodboard-dialog";

interface MoodboardPin {
  id: string;
  type: string;
  imageUrl: string | null;
  color: string | null;
  position: number;
  createdAt: string;
}

interface MoodboardDetailData {
  id: string;
  title: string;
  userId: string;
  pins: MoodboardPin[];
  createdAt: string;
}

interface MoodboardDetailProps {
  moodboardId: string;
  onBack: () => void;
}

export function MoodboardDetail({ moodboardId, onBack }: MoodboardDetailProps) {
  const [data, setData] = useState<MoodboardDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingPinId, setDeletingPinId] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/moodboards/${moodboardId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load moodboard");
      }
      const result: MoodboardDetailData = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load moodboard");
    } finally {
      setLoading(false);
    }
  }, [moodboardId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleDeletePin = useCallback(
    async (pinId: string) => {
      setDeletingPinId(pinId);
      try {
        const res = await fetch(
          `/api/v1/moodboards/${moodboardId}/pins/${pinId}`,
          { method: "DELETE" },
        );

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to delete pin");
        }

        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            pins: prev.pins.filter((p) => p.id !== pinId),
          };
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete pin");
      } finally {
        setDeletingPinId(null);
      }
    },
    [moodboardId],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6", "sk-7", "sk-8"].map(
            (key) => (
              <div
                key={key}
                className="aspect-square animate-pulse rounded-lg bg-muted"
              />
            ),
          )}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={onBack}>
          Back to Moodboards
        </Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            &larr; Back
          </Button>
          <h2 className="font-semibold text-xl">{data.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <AddPinDialog moodboardId={moodboardId} onPinAdded={fetchDetail} />
          <DeleteMoodboardDialog
            moodboardId={moodboardId}
            moodboardTitle={data.title}
            onDeleted={onBack}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {data.pins.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="text-4xl">📌</div>
          <h3 className="font-medium text-lg">No pins yet</h3>
          <p className="text-muted-foreground">
            Pin images and colors to your board to start curating your
            inspiration.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {data.pins.map((pinItem) => (
            <div
              key={pinItem.id}
              className="group relative aspect-square overflow-hidden rounded-lg border"
            >
              {pinItem.type === "image" && pinItem.imageUrl ? (
                <Image
                  src={pinItem.imageUrl}
                  alt={`Pin ${pinItem.position + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    backgroundColor: pinItem.color ?? "#e5e7eb",
                  }}
                >
                  <span className="font-mono text-white text-xs drop-shadow">
                    {pinItem.color}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleDeletePin(pinItem.id)}
                disabled={deletingPinId === pinItem.id}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 disabled:opacity-50"
                aria-label="Delete pin"
              >
                {deletingPinId === pinItem.id ? (
                  <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <title>Delete pin</title>
                    <path
                      fillRule="evenodd"
                      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
