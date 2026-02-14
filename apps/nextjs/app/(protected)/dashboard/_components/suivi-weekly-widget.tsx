import { Card, CardContent } from "@packages/ui/components/ui/card";
import { getMoodWeek } from "@/adapters/queries/mood-week.query";
import { WeeklyMoodChart } from "./weekly-mood-chart";

interface SuiviWeeklyWidgetProps {
  userId: string;
  compact?: boolean;
}

const DAY_LABELS: Record<string, string> = {
  Monday: "lundi",
  Tuesday: "mardi",
  Wednesday: "mercredi",
  Thursday: "jeudi",
  Friday: "vendredi",
  Saturday: "samedi",
  Sunday: "dimanche",
};

export async function SuiviWeeklyWidget({
  userId,
  compact,
}: SuiviWeeklyWidgetProps) {
  let entries: Awaited<ReturnType<typeof getMoodWeek>>["entries"] = [];
  let weeklyTrend = "Pas assez de donnees";
  try {
    const data = await getMoodWeek(userId);
    entries = data.entries;
    weeklyTrend = data.weeklyTrend;
  } catch {
    /* empty */
  }

  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const weekLabel = `du ${monday.getDate()} au ${sunday.getDate()} ${sunday.toLocaleDateString("fr-FR", { month: "long" })}`;

  const chartData = entries.map((e) => ({
    day: DAY_LABELS[e.dayOfWeek] ?? e.dayOfWeek,
    average: e.intensity,
  }));

  return (
    <Card className="border-0">
      <CardContent className="pt-6">
        <h3
          className={
            compact ? "text-sm font-semibold" : "text-lg font-semibold"
          }
        >
          Suivi
        </h3>
        <p
          className={
            compact
              ? "text-xs text-muted-foreground"
              : "text-sm text-muted-foreground"
          }
        >
          Humeurs de la semaine ({weekLabel})
        </p>
        <div className={compact ? "mt-1" : "mt-4"}>
          {chartData.length > 0 ? (
            <WeeklyMoodChart
              data={chartData}
              height={compact ? 80 : undefined}
            />
          ) : (
            <div className="flex h-20 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Pas encore de donnees cette semaine
              </p>
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {weeklyTrend} &#8599;
        </p>
      </CardContent>
    </Card>
  );
}
