"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@packages/ui/components/ui/chart";
import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { IGetMoodStatsOutputDto } from "@/application/dto/mood/get-mood-stats.dto";
import { getMoodColor, getMoodLabel } from "./mood-legend";

const chartConfig = {
  count: {
    label: "Count",
  },
} satisfies ChartConfig;

export function MoodBarChart() {
  const [data, setData] = useState<IGetMoodStatsOutputDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/mood/stats?period=week");
      if (res.ok) {
        setData((await res.json()) as IGetMoodStatsOutputDto);
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
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (!data || data.totalEntries === 0) {
    return null;
  }

  const chartData = data.categoryDistribution.map((entry) => ({
    category: getMoodLabel(entry.category),
    count: entry.count,
    fill: getMoodColor(entry.category),
  }));

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Weekly Mood Distribution
      </h2>
      <div className="rounded-lg border p-4">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              axisLine={false}
              width={75}
            />
            <XAxis type="number" allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" radius={4} />
          </BarChart>
        </ChartContainer>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          {data.totalEntries} entries &middot; avg intensity{" "}
          {data.averageIntensity}/10
          {data.dominantMood && (
            <> &middot; dominant: {getMoodLabel(data.dominantMood)}</>
          )}
        </div>
      </div>
    </div>
  );
}
