import { db } from "@packages/drizzle";
import { moodEntry } from "@packages/drizzle/schema";
import { and, avg, count, desc, eq, gte } from "drizzle-orm";
import type { IGetMoodStatsOutputDto } from "@/application/dto/mood/get-mood-stats.dto";

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getStartDate(period: "week" | "6months"): string {
  const now = new Date();
  if (period === "week") {
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    return formatDate(monday);
  }
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return formatDate(sixMonthsAgo);
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
      .orderBy(desc(count())),
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
