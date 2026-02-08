"use client";

import { useCallback, useEffect, useState } from "react";
import type { IGetStreakOutputDto } from "@/application/dto/journal/get-streak.dto";

export function StreakCounter() {
  const [data, setData] = useState<IGetStreakOutputDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/journal/streak");
      if (!res.ok) return;
      const json = (await res.json()) as IGetStreakOutputDto;
      setData(json);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  if (loading) {
    return <div className="mb-6 h-20 animate-pulse rounded-lg bg-muted" />;
  }

  if (!data) return null;

  return (
    <div className="mb-6 rounded-lg border bg-gradient-to-r from-orange-50 to-amber-50 p-4 dark:from-orange-950/30 dark:to-amber-950/30">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-2xl dark:bg-orange-900/50">
          {data.currentStreak > 0 ? "\uD83D\uDD25" : "\u270D\uFE0F"}
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {data.currentStreak}
            </span>
            <span className="text-sm text-muted-foreground">day streak</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {data.currentStreak > 0
              ? `Best: ${data.longestStreak} days`
              : "Write a journal entry to start your streak!"}
          </p>
        </div>
      </div>
    </div>
  );
}
