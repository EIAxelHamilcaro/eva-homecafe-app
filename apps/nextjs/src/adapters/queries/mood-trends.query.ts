import { db } from "@packages/drizzle";
import { moodEntry } from "@packages/drizzle/schema";
import { sql } from "drizzle-orm";
import type { IGetMoodTrendsOutputDto } from "@/application/dto/mood/get-mood-trends.dto";

export async function getMoodTrends(
  userId: string,
): Promise<IGetMoodTrendsOutputDto> {
  const records = await db.execute<{
    month: string;
    dominant_category: string;
    avg_intensity: string;
    entry_count: string;
  }>(sql`
    SELECT
      to_char(${moodEntry.moodDate}::timestamp, 'YYYY-MM') AS month,
      mode() WITHIN GROUP (ORDER BY ${moodEntry.moodCategory}) AS dominant_category,
      AVG(${moodEntry.moodIntensity}) AS avg_intensity,
      COUNT(*) AS entry_count
    FROM ${moodEntry}
    WHERE ${moodEntry.userId} = ${userId}
      AND ${moodEntry.moodDate} >= (CURRENT_DATE - interval '6 months')::date
    GROUP BY to_char(${moodEntry.moodDate}::timestamp, 'YYYY-MM')
    ORDER BY month ASC
  `);

  const months = records.rows.map((row) => ({
    month: row.month,
    dominantCategory: row.dominant_category ?? "unknown",
    averageIntensity:
      Math.round(Number.parseFloat(String(row.avg_intensity)) * 10) / 10,
    entryCount: Number(row.entry_count),
  }));

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  const currentMonth = months.find((m) => m.month === currentMonthStr);
  const prevMonth = months.find((m) => m.month === prevMonthStr);

  let monthlyTrend = "Pas assez de donnees";
  if (currentMonth && prevMonth && prevMonth.averageIntensity !== 0) {
    const pct =
      ((currentMonth.averageIntensity - prevMonth.averageIntensity) /
        prevMonth.averageIntensity) *
      100;
    const sign = pct >= 0 ? "hausse" : "baisse";
    monthlyTrend = `En ${sign} de ${Math.abs(pct).toFixed(1)}% vs mois dernier`;
  }

  return { months, monthlyTrend };
}
