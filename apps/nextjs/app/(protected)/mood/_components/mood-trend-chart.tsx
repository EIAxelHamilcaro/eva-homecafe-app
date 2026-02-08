"use client";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@packages/ui/components/ui/chart";
import { useCallback, useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { IGetMoodTrendsOutputDto } from "@/application/dto/mood/get-mood-trends.dto";
import { getMoodColor, getMoodLabel } from "./mood-legend";

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

const chartConfig = {
  averageIntensity: {
    label: "Avg Intensity",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

export function MoodTrendChart() {
  const [data, setData] = useState<IGetMoodTrendsOutputDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/mood/trends");
      if (res.ok) {
        setData((await res.json()) as IGetMoodTrendsOutputDto);
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

  if (!data || data.months.length === 0) {
    return null;
  }

  const chartData = data.months.map((m) => ({
    month: formatMonth(m.month),
    averageIntensity: m.averageIntensity,
    fill: getMoodColor(m.dominantCategory),
    dominantCategory: getMoodLabel(m.dominantCategory),
    entryCount: m.entryCount,
  }));

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        6-Month Trend
      </h2>
      <div className="rounded-lg border p-4">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis domain={[0, 10]} tickLine={false} axisLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => (
                    <div className="space-y-1">
                      <div>Intensity: {String(value)}/10</div>
                      <div>
                        Dominant:{" "}
                        {
                          (item.payload as { dominantCategory: string })
                            .dominantCategory
                        }
                      </div>
                      <div>
                        Entries:{" "}
                        {(item.payload as { entryCount: number }).entryCount}
                      </div>
                    </div>
                  )}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="averageIntensity"
              stroke="var(--color-primary)"
              fill="var(--color-primary)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {data.months.map((m) => (
            <div key={m.month} className="flex items-center gap-1.5 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getMoodColor(m.dominantCategory) }}
              />
              <span className="text-muted-foreground">
                {formatMonth(m.month)}: {getMoodLabel(m.dominantCategory)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
