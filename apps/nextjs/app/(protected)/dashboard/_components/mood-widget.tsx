import { Card, CardContent } from "@packages/ui/components/ui/card";
import { getMoodTrends } from "@/adapters/queries/mood-trends.query";
import { MonthlyMoodChart } from "./monthly-mood-chart";
import { WidgetEmptyState } from "./widget-empty-state";

interface MoodWidgetProps {
  userId: string;
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

export async function MoodWidget({ userId }: MoodWidgetProps) {
  let months: Awaited<ReturnType<typeof getMoodTrends>>["months"] = [];
  let monthlyTrend = "Pas assez de donnees";
  try {
    const trends = await getMoodTrends(userId);
    months = trends.months;
    monthlyTrend = trends.monthlyTrend;
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
        <p className="mt-3 text-xs text-muted-foreground">
          {monthlyTrend} &#8599;
        </p>
      </CardContent>
    </Card>
  );
}
