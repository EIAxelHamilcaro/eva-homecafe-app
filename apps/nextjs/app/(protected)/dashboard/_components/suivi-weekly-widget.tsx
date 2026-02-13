import { Card, CardContent } from "@packages/ui/components/ui/card";
import {
  getMoodPreviousWeekAverage,
  getMoodWeek,
} from "@/adapters/queries/mood-week.query";
import { WeeklyMoodChart } from "./weekly-mood-chart";

interface SuiviWeeklyWidgetProps {
  userId: string;
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

function computeWeekTrend(
  thisWeekAvg: number | null,
  prevWeekAvg: number | null,
): string {
  if (thisWeekAvg === null || prevWeekAvg === null || prevWeekAvg === 0) {
    return "Pas assez de donnees";
  }
  const pct = ((thisWeekAvg - prevWeekAvg) / prevWeekAvg) * 100;
  const sign = pct >= 0 ? "hausse" : "baisse";
  return `En ${sign} de ${Math.abs(pct).toFixed(1)}% vs semaine derniere`;
}

export async function SuiviWeeklyWidget({ userId }: SuiviWeeklyWidgetProps) {
  let entries: Awaited<ReturnType<typeof getMoodWeek>>["entries"] = [];
  let prevWeekAvg: number | null = null;
  try {
    const [data, prevAvg] = await Promise.all([
      getMoodWeek(userId),
      getMoodPreviousWeekAverage(userId),
    ]);
    entries = data.entries;
    prevWeekAvg = prevAvg;
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

  const thisWeekAvg =
    entries.length > 0
      ? entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length
      : null;
  const trend = computeWeekTrend(thisWeekAvg, prevWeekAvg);

  return (
    <Card className="border-0">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold">Suivi</h3>
        <p className="text-sm text-muted-foreground">
          Humeurs de la semaine ({weekLabel})
        </p>
        <div className="mt-4">
          {chartData.length > 0 ? (
            <WeeklyMoodChart data={chartData} />
          ) : (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Pas encore de donnees cette semaine
              </p>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{trend} &#8599;</p>
      </CardContent>
    </Card>
  );
}
