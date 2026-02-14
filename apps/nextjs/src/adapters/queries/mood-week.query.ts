import { db } from "@packages/drizzle";
import { moodEntry } from "@packages/drizzle/schema";
import { and, asc, eq, gte, lte } from "drizzle-orm";
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

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getISOWeekBounds(offset = 0): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: formatDate(monday), end: formatDate(sunday) };
}

export async function getMoodWeek(
  userId: string,
): Promise<IGetMoodWeekOutputDto> {
  const thisWeek = getISOWeekBounds(0);

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
        gte(moodEntry.moodDate, thisWeek.start),
        lte(moodEntry.moodDate, thisWeek.end),
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

  const prevWeekAvg = await getMoodPreviousWeekAverage(userId);
  const thisWeekAvg =
    entries.length > 0
      ? entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length
      : null;

  let weeklyTrend = "Pas assez de donnees";
  if (thisWeekAvg !== null && prevWeekAvg !== null && prevWeekAvg !== 0) {
    const pct = ((thisWeekAvg - prevWeekAvg) / prevWeekAvg) * 100;
    const sign = pct >= 0 ? "hausse" : "baisse";
    weeklyTrend = `En ${sign} de ${Math.abs(pct).toFixed(1)}% vs semaine derniere`;
  }

  return { entries, weeklyTrend };
}

export async function getMoodPreviousWeekAverage(
  userId: string,
): Promise<number | null> {
  const prevWeek = getISOWeekBounds(-1);

  const records = await db
    .select({
      moodIntensity: moodEntry.moodIntensity,
    })
    .from(moodEntry)
    .where(
      and(
        eq(moodEntry.userId, userId),
        gte(moodEntry.moodDate, prevWeek.start),
        lte(moodEntry.moodDate, prevWeek.end),
      ),
    );

  if (records.length === 0) return null;
  return records.reduce((sum, r) => sum + r.moodIntensity, 0) / records.length;
}
