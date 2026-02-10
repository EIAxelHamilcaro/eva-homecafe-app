import { db, post } from "@packages/drizzle";
import { and, desc, eq, sql } from "drizzle-orm";
import type { IGetStreakOutputDto } from "@/application/dto/journal/get-streak.dto";

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function normalizeDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function calculateStreak(
  userId: string,
): Promise<IGetStreakOutputDto> {
  const result = await db
    .selectDistinct({
      date: sql<string>`DATE(${post.createdAt})`,
    })
    .from(post)
    .where(and(eq(post.userId, userId), eq(post.isPrivate, true)))
    .orderBy(desc(sql`DATE(${post.createdAt})`));

  if (result.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastPostDate: null,
    };
  }

  const dates = result.map((r) =>
    normalizeDate(new Date(`${r.date}T00:00:00`)),
  );
  const firstEntry = dates[0] as Date;
  const lastPostDate = result[0]?.date ?? null;
  const today = normalizeDate(new Date());

  const startsFromToday = isSameDay(firstEntry, today);
  const startsFromYesterday = isSameDay(firstEntry, subtractDays(today, 1));
  const isActive = startsFromToday || startsFromYesterday;

  let currentStreak = 0;
  let longestStreak = 0;

  if (isActive) {
    currentStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const current = dates[i] as Date;
      const previous = dates[i - 1] as Date;
      const diffMs = previous.getTime() - current.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  let tempStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const current = dates[i] as Date;
    const previous = dates[i - 1] as Date;
    const diffMs = previous.getTime() - current.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    lastPostDate,
  };
}
