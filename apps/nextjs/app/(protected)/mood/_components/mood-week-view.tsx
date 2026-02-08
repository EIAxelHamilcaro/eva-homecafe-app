"use client";

import { useCallback, useEffect, useState } from "react";
import type { IGetMoodWeekOutputDto } from "@/application/dto/mood/get-mood-week.dto";
import { getMoodColor, getMoodLabel } from "./mood-legend";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function MoodWeekView() {
  const [data, setData] = useState<IGetMoodWeekOutputDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/mood/week");
      if (res.ok) {
        setData((await res.json()) as IGetMoodWeekOutputDto);
      }
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="h-24 animate-pulse rounded-lg bg-muted" />;
  }

  if (!data || data.entries.length === 0) {
    return null;
  }

  const entryMap = new Map(
    data.entries.map((e) => {
      const date = new Date(`${e.date}T00:00:00`);
      const jsDay = date.getDay();
      const mondayIndex = jsDay === 0 ? 6 : jsDay - 1;
      return [mondayIndex, e];
    }),
  );

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        This Week
      </h2>
      <div className="grid grid-cols-7 gap-2">
        {WEEK_DAYS.map((day, index) => {
          const entry = entryMap.get(index);
          return (
            <div
              key={day}
              className="flex flex-col items-center gap-1 rounded-lg border p-2"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {day}
              </span>
              {entry ? (
                <>
                  <div
                    className="h-8 w-8 rounded-full"
                    style={{ backgroundColor: getMoodColor(entry.category) }}
                    title={getMoodLabel(entry.category)}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {entry.intensity}/10
                  </span>
                </>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-muted-foreground/30">
                  <span className="text-xs text-muted-foreground/50">-</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
