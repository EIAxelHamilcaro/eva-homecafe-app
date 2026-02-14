import { db } from "@packages/drizzle";
import { emotionEntry } from "@packages/drizzle/schema";
import { and, asc, eq, gte, lt } from "drizzle-orm";

export interface EmotionYearEntry {
  date: string;
  category: string;
}

export async function getEmotionYearCalendar(
  userId: string,
  year: number,
): Promise<EmotionYearEntry[]> {
  const startDate = `${year}-01-01`;
  const endDate = `${year + 1}-01-01`;

  const records = await db
    .select({
      emotionDate: emotionEntry.emotionDate,
      emotionCategory: emotionEntry.emotionCategory,
    })
    .from(emotionEntry)
    .where(
      and(
        eq(emotionEntry.userId, userId),
        gte(emotionEntry.emotionDate, startDate),
        lt(emotionEntry.emotionDate, endDate),
      ),
    )
    .orderBy(asc(emotionEntry.emotionDate));

  return records.map((r) => ({
    date: r.emotionDate,
    category: r.emotionCategory,
  }));
}
