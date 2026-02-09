"use client";

import { Button } from "@packages/ui/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    async function fetchDetail() {
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
        setError(
          err instanceof Error ? err.message : "Failed to load moodboard",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [moodboardId]);

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

  if (error) {
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          &larr; Back
        </Button>
        <h2 className="font-semibold text-xl">{data.title}</h2>
      </div>

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
              className="relative aspect-square overflow-hidden rounded-lg border"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
