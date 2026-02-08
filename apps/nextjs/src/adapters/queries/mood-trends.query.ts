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

  return { months };
}
