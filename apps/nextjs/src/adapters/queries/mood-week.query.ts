import { db } from "@packages/drizzle";
import { moodEntry } from "@packages/drizzle/schema";
import { and, asc, eq, gte, lt, lte, sql } from "drizzle-orm";
import type { IGetMoodWeekOutputDto } from "@/application/dto/mood/get-mood-week.dto";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export async function getMoodWeek(
  userId: string,
): Promise<IGetMoodWeekOutputDto> {
  const records = await db
    .select({
      moodDate: moodEntry.moodDate,
      moodCategory: moodEntry.moodCategory,
      moodIntensity: moodEntry.moodIntensity,
    })
    .from(moodEntry)
    .where(
      and(
        eq(moodEntry.userId, userId),
        gte(moodEntry.moodDate, sql`date_trunc('week', CURRENT_DATE)::date`),
        lte(
          moodEntry.moodDate,
          sql`(date_trunc('week', CURRENT_DATE) + interval '6 days')::date`,
        ),
      ),
    )
    .orderBy(asc(moodEntry.moodDate));

  const entries = records.map((record) => {
    const date = new Date(`${record.moodDate}T00:00:00`);
    return {
      date: record.moodDate,
      dayOfWeek: DAYS_OF_WEEK[date.getDay()] ?? "Unknown",
      category: record.moodCategory,
      intensity: record.moodIntensity,
    };
  });

  return { entries };
}

export async function getMoodPreviousWeekAverage(
  userId: string,
): Promise<number | null> {
  const records = await db
    .select({
      moodIntensity: moodEntry.moodIntensity,
    })
    .from(moodEntry)
    .where(
      and(
        eq(moodEntry.userId, userId),
        gte(
          moodEntry.moodDate,
          sql`(date_trunc('week', CURRENT_DATE) - interval '7 days')::date`,
        ),
        lt(moodEntry.moodDate, sql`date_trunc('week', CURRENT_DATE)::date`),
      ),
    );

  if (records.length === 0) return null;
  return records.reduce((sum, r) => sum + r.moodIntensity, 0) / records.length;
}
