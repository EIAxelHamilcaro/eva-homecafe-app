import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import Link from "next/link";
import { getMoodStats } from "@/adapters/queries/mood-stats.query";
import { getTodayMood } from "@/adapters/queries/today-mood.query";
import { WidgetEmptyState } from "./widget-empty-state";

const MOOD_EMOJI: Record<string, string> = {
  happy: "\uD83D\uDE0A",
  sad: "\uD83D\uDE22",
  angry: "\uD83D\uDE21",
  anxious: "\uD83D\uDE30",
  calm: "\uD83D\uDE0C",
  excited: "\uD83E\uDD29",
  tired: "\uD83D\uDE34",
  neutral: "\uD83D\uDE10",
};

interface MoodWidgetProps {
  userId: string;
}

export async function MoodWidget({ userId }: MoodWidgetProps) {
  const [stats, todayMood] = await Promise.all([
    getMoodStats(userId, "week"),
    getTodayMood(userId),
  ]);

  if (stats.totalEntries === 0) {
    return <WidgetEmptyState type="mood" />;
  }

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
            <span className="text-2xl">
              {MOOD_EMOJI[todayMood.category] ?? "\uD83D\uDE10"}
            </span>
            <span className="text-sm text-muted-foreground">
              Today: {todayMood.category} ({todayMood.intensity}/10)
            </span>
          </div>
        )}
        {stats.dominantMood && (
          <p className="text-sm text-muted-foreground">
            This week: {stats.dominantMood} mood dominant ({stats.totalEntries}{" "}
            {stats.totalEntries === 1 ? "entry" : "entries"})
          </p>
        )}
        {stats.categoryDistribution.length > 0 && (
          <div className="mt-3 space-y-1">
            {stats.categoryDistribution.slice(0, 3).map((cat) => (
              <div key={cat.category} className="flex items-center gap-2">
                <span className="text-sm">
                  {MOOD_EMOJI[cat.category] ?? "\uD83D\uDE10"}
                </span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {cat.percentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
