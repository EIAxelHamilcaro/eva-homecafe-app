import { db } from "@packages/drizzle";
import { moodEntry } from "@packages/drizzle/schema";
import { and, eq } from "drizzle-orm";
import type { IGetTodayMoodOutputDto } from "@/application/dto/mood/get-today-mood.dto";

export async function getTodayMood(
  userId: string,
): Promise<IGetTodayMoodOutputDto> {
  const today = new Date().toISOString().split("T")[0] ?? "";
  return getMoodByDate(userId, today);
}

export async function getMoodByDate(
  userId: string,
  date: string,
): Promise<IGetTodayMoodOutputDto> {
  const records = await db
    .select()
    .from(moodEntry)
    .where(and(eq(moodEntry.userId, userId), eq(moodEntry.moodDate, date)))
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
