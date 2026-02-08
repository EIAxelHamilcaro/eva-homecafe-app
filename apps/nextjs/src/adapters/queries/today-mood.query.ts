import { db } from "@packages/drizzle";
import { moodEntry } from "@packages/drizzle/schema";
import { and, eq, sql } from "drizzle-orm";
import type { IGetTodayMoodOutputDto } from "@/application/dto/mood/get-today-mood.dto";

export async function getTodayMood(
  userId: string,
): Promise<IGetTodayMoodOutputDto> {
  const records = await db
    .select()
    .from(moodEntry)
    .where(
      and(
        eq(moodEntry.userId, userId),
        eq(moodEntry.moodDate, sql`CURRENT_DATE`),
      ),
    )
    .limit(1);

  const record = records[0];
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    category: record.moodCategory,
    intensity: record.moodIntensity,
    createdAt: record.createdAt.toISOString(),
  };
}
