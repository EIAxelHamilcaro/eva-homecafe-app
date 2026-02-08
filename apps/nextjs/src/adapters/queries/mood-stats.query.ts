import { db } from "@packages/drizzle";
import { moodEntry } from "@packages/drizzle/schema";
import { and, avg, count, eq, gte, sql } from "drizzle-orm";
import type { IGetMoodStatsOutputDto } from "@/application/dto/mood/get-mood-stats.dto";

function getStartDate(period: "week" | "6months"): ReturnType<typeof sql> {
  if (period === "week") {
    return sql`date_trunc('week', CURRENT_DATE)::date`;
  }
  return sql`(CURRENT_DATE - interval '6 months')::date`;
}

export async function getMoodStats(
  userId: string,
  period: "week" | "6months",
): Promise<IGetMoodStatsOutputDto> {
  const startDate = getStartDate(period);

  const [categoryResults, summaryResults] = await Promise.all([
    db
      .select({
        category: moodEntry.moodCategory,
        count: count().as("count"),
      })
      .from(moodEntry)
      .where(
        and(eq(moodEntry.userId, userId), gte(moodEntry.moodDate, startDate)),
      )
      .groupBy(moodEntry.moodCategory)
      .orderBy(sql`count(*) DESC`),
    db
      .select({
        totalEntries: count().as("total_entries"),
        averageIntensity: avg(moodEntry.moodIntensity).as("avg_intensity"),
      })
      .from(moodEntry)
      .where(
        and(eq(moodEntry.userId, userId), gte(moodEntry.moodDate, startDate)),
      ),
  ]);

  const totalEntries = summaryResults[0]?.totalEntries ?? 0;
  const averageIntensity = summaryResults[0]?.averageIntensity
    ? Number.parseFloat(String(summaryResults[0].averageIntensity))
    : 0;

  const categoryDistribution = categoryResults.map((row) => ({
    category: row.category,
    count: row.count,
    percentage:
      totalEntries > 0 ? Math.round((row.count / totalEntries) * 100) : 0,
  }));

  const dominantMood =
    categoryResults.length > 0 ? (categoryResults[0]?.category ?? null) : null;

  return {
    categoryDistribution,
    averageIntensity: Math.round(averageIntensity * 10) / 10,
    totalEntries,
    dominantMood,
  };
}
