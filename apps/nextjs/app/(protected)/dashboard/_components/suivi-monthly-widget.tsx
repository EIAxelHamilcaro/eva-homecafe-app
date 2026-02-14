import { Card, CardContent } from "@packages/ui/components/ui/card";
import { getMoodTrends } from "@/adapters/queries/mood-trends.query";
import { MonthlyMoodChart } from "./monthly-mood-chart";

interface SuiviMonthlyWidgetProps {
  userId: string;
  compact?: boolean;
}

const MONTH_LABELS: Record<string, string> = {
  "01": "janvier",
  "02": "f\u00e9vrier",
  "03": "mars",
  "04": "avril",
  "05": "mai",
  "06": "juin",
  "07": "juillet",
  "08": "ao\u00fbt",
  "09": "septembre",
  "10": "octobre",
  "11": "novembre",
  "12": "d\u00e9cembre",
};

export async function SuiviMonthlyWidget({
  userId,
  compact,
}: SuiviMonthlyWidgetProps) {
  let months: Awaited<ReturnType<typeof getMoodTrends>>["months"] = [];
  try {
    const trends = await getMoodTrends(userId);
    months = trends.months;
  } catch {
    /* empty */
  }

  if (months.length === 0) {
    return (
      <Card className="border-0">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold">Suivi</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Pas encore de donnees mensuelles
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = months.map((m) => {
    const monthNum = m.month.split("-")[1] ?? "01";
    return {
      month: MONTH_LABELS[monthNum] ?? monthNum,
      average: m.averageIntensity,
    };
  });

  const first = months[0];
  const last = months[months.length - 1];
  const firstLabel = first
    ? (MONTH_LABELS[first.month.split("-")[1] ?? "01"] ?? "")
    : "";
  const lastLabel = last
    ? (MONTH_LABELS[last.month.split("-")[1] ?? "01"] ?? "")
    : "";
  const yearLabel = last?.month.split("-")[0] ?? new Date().getFullYear();

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
          Moodboard {firstLabel} &rarr; {lastLabel} {yearLabel}
        </p>
        <div className={compact ? "mt-1" : "mt-4"}>
          <MonthlyMoodChart
            data={chartData}
            height={compact ? 80 : undefined}
          />
        </div>
      </CardContent>
    </Card>
  );
}
