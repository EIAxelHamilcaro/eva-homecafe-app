import { Card, CardContent } from "@packages/ui/components/ui/card";
import { getMoodTrends } from "@/adapters/queries/mood-trends.query";
import { MonthlyMoodChart } from "./monthly-mood-chart";
import { WidgetEmptyState } from "./widget-empty-state";

interface MoodWidgetProps {
  userId: string;
}

const MONTH_LABELS: Record<string, string> = {
  "01": "janvier",
  "02": "février",
  "03": "mars",
  "04": "avril",
  "05": "mai",
  "06": "juin",
  "07": "juillet",
  "08": "août",
  "09": "septembre",
  "10": "octobre",
  "11": "novembre",
  "12": "décembre",
};

function computeMonthTrend(
  months: { month: string; averageIntensity: number }[],
): string {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  const currentMonth = months.find((m) => m.month === currentMonthStr);
  const prevMonth = months.find((m) => m.month === prevMonthStr);

  if (!currentMonth || !prevMonth || prevMonth.averageIntensity === 0) {
    return "Pas assez de donnees";
  }

  const pct =
    ((currentMonth.averageIntensity - prevMonth.averageIntensity) /
      prevMonth.averageIntensity) *
    100;
  const sign = pct >= 0 ? "hausse" : "baisse";
  return `En ${sign} de ${Math.abs(pct).toFixed(1)}% vs mois dernier`;
}

export async function MoodWidget({ userId }: MoodWidgetProps) {
  let months: Awaited<ReturnType<typeof getMoodTrends>>["months"] = [];
  try {
    const trends = await getMoodTrends(userId);
    months = trends.months;
  } catch {
    /* empty */
  }

  if (months.length === 0) {
    return <WidgetEmptyState type="mood" />;
  }

  const chartData = months.map((m) => {
    const monthNum = m.month.split("-")[1] ?? "01";
    return {
      month: MONTH_LABELS[monthNum] ?? monthNum,
      average: m.averageIntensity,
    };
  });

  const trend = computeMonthTrend(months);

  return (
    <Card className="border-0">
      <CardContent className="flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold">Suivi</h3>
          <p className="text-sm text-muted-foreground">
            Moodboard janvier &rarr; juin {new Date().getFullYear()}
          </p>
        </div>
        <div className="mt-4">
          <MonthlyMoodChart data={chartData} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{trend} &#8599;</p>
      </CardContent>
    </Card>
  );
}
