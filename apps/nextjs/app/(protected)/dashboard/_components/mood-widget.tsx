import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import Link from "next/link";
import { getMoodStats } from "@/adapters/queries/mood-stats.query";
import { getTodayMood } from "@/adapters/queries/today-mood.query";
import {
  getMoodColor,
  getMoodEmoji,
  getMoodLabel,
} from "@/app/(protected)/mood/_components/mood-config";
import { MoodMiniChart } from "./mood-mini-chart";
import { WidgetEmptyState } from "./widget-empty-state";

interface MoodWidgetProps {
  userId: string;
}

export async function MoodWidget({ userId }: MoodWidgetProps) {
  let stats: Awaited<ReturnType<typeof getMoodStats>>;
  let todayMood: Awaited<ReturnType<typeof getTodayMood>>;

  try {
    [stats, todayMood] = await Promise.all([
      getMoodStats(userId, "week"),
      getTodayMood(userId),
    ]);
  } catch {
    return <WidgetEmptyState type="mood" />;
  }

  if (stats.totalEntries === 0) {
    return <WidgetEmptyState type="mood" />;
  }

  const chartData = stats.categoryDistribution.map((entry) => ({
    category: getMoodLabel(entry.category),
    count: entry.count,
    fill: getMoodColor(entry.category),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href="/mood" className="hover:underline">
            Mood Summary
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayMood && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">{getMoodEmoji(todayMood.category)}</span>
            <span className="text-sm text-muted-foreground">
              Today: {getMoodLabel(todayMood.category)} ({todayMood.intensity}
              /10)
            </span>
          </div>
        )}
        {stats.dominantMood && (
          <div className="mb-3 flex items-center gap-2">
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: getMoodColor(stats.dominantMood) }}
            />
            <span className="text-sm text-muted-foreground">
              {getMoodLabel(stats.dominantMood)} &middot;{" "}
              {stats.averageIntensity}/10 avg &middot; {stats.totalEntries}{" "}
              {stats.totalEntries === 1 ? "entry" : "entries"}
            </span>
          </div>
        )}
        {chartData.length > 0 && <MoodMiniChart data={chartData} />}
      </CardContent>
    </Card>
  );
}
