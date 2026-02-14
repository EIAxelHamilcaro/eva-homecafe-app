import { db } from "@packages/drizzle";
import { moodEntry } from "@packages/drizzle/schema";
import { and, asc, eq, gte, lt } from "drizzle-orm";

export interface MoodYearEntry {
  date: string;
  category: string;
}

export async function getMoodYearCalendar(
  userId: string,
  year: number,
): Promise<MoodYearEntry[]> {
  const startDate = `${year}-01-01`;
  const endDate = `${year + 1}-01-01`;

  const records = await db
    .select({
      moodDate: moodEntry.moodDate,
      moodCategory: moodEntry.moodCategory,
    })
    .from(moodEntry)
    .where(
      and(
        eq(moodEntry.userId, userId),
        gte(moodEntry.moodDate, startDate),
        lt(moodEntry.moodDate, endDate),
      ),
    )
    .orderBy(asc(moodEntry.moodDate));

  return records.map((r) => ({
    date: r.moodDate,
    category: r.moodCategory,
  }));
}
