"use client";

import { useCallback, useEffect, useState } from "react";
import type { IGetMoodStatsOutputDto } from "@/application/dto/mood/get-mood-stats.dto";
import { MoodBarChart } from "./mood-bar-chart";
import { MoodEmptyState } from "./mood-empty-state";
import { MoodLegend } from "./mood-legend";
import { MoodTrendChart } from "./mood-trend-chart";
import { MoodWeekView } from "./mood-week-view";

export function MoodHistory() {
  const [hasEntries, setHasEntries] = useState<boolean | null>(null);

  const checkEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/mood/stats?period=6months");
      if (res.ok) {
        const data = (await res.json()) as IGetMoodStatsOutputDto;
        setHasEntries(data.totalEntries > 0);
      } else {
        setHasEntries(false);
      }
    } catch {
      setHasEntries(false);
    }
  }, []);

  useEffect(() => {
    checkEntries();
  }, [checkEntries]);

  if (hasEntries === null) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (!hasEntries) {
    return <MoodEmptyState />;
  }

  return (
    <div className="space-y-8">
      <MoodWeekView />
      <MoodBarChart />
      <MoodTrendChart />
      <MoodLegend />
    </div>
  );
}
