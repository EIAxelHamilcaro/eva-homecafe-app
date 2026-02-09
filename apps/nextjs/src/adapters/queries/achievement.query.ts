import {
  board,
  boardColumn,
  card,
  db,
  friendRequest,
  moodboard,
  moodEntry,
  photo,
  post,
} from "@packages/drizzle";
import { and, count, desc, eq, sql } from "drizzle-orm";

function normalizeDate(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

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

function calculateConsecutiveDays(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const firstEntry = dates[0] as Date;
  const today = normalizeDate(new Date());
  const startsFromToday = isSameDay(firstEntry, today);
  const startsFromYesterday = isSameDay(firstEntry, subtractDays(today, 1));

  if (!startsFromToday && !startsFromYesterday) return 0;

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const current = dates[i] as Date;
    const previous = dates[i - 1] as Date;
    const diffMs = previous.getTime() - current.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export async function getJournalStreakDays(userId: string): Promise<number> {
  const result = await db
    .selectDistinct({
      date: sql<string>`DATE(${post.createdAt})`,
    })
    .from(post)
    .where(and(eq(post.userId, userId), eq(post.isPrivate, true)))
    .orderBy(desc(sql`DATE(${post.createdAt})`));

  const dates = result.map((r) =>
    normalizeDate(new Date(`${r.date}T00:00:00`)),
  );
  return calculateConsecutiveDays(dates);
}

export async function getMoodStreakDays(userId: string): Promise<number> {
  const result = await db
    .selectDistinct({
      date: sql<string>`DATE(${moodEntry.createdAt})`,
    })
    .from(moodEntry)
    .where(eq(moodEntry.userId, userId))
    .orderBy(desc(sql`DATE(${moodEntry.createdAt})`));

  const dates = result.map((r) =>
    normalizeDate(new Date(`${r.date}T00:00:00`)),
  );
  return calculateConsecutiveDays(dates);
}

export async function getPostCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(post)
    .where(eq(post.userId, userId));
  return result?.value ?? 0;
}

export async function getPhotoCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(photo)
    .where(eq(photo.userId, userId));
  return result?.value ?? 0;
}

export async function getFriendCount(userId: string): Promise<number> {
  const [sent] = await db
    .select({ value: count() })
    .from(friendRequest)
    .where(
      and(
        eq(friendRequest.senderId, userId),
        eq(friendRequest.status, "accepted"),
      ),
    );
  const [received] = await db
    .select({ value: count() })
    .from(friendRequest)
    .where(
      and(
        eq(friendRequest.receiverId, userId),
        eq(friendRequest.status, "accepted"),
      ),
    );
  return (sent?.value ?? 0) + (received?.value ?? 0);
}

export async function getMoodboardCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(moodboard)
    .where(eq(moodboard.userId, userId));
  return result?.value ?? 0;
}

export async function getCompletedCardCount(userId: string): Promise<number> {
  const result = await db
    .select({ value: count() })
    .from(card)
    .innerJoin(boardColumn, eq(card.columnId, boardColumn.id))
    .innerJoin(board, eq(boardColumn.boardId, board.id))
    .where(and(eq(board.userId, userId), eq(card.isCompleted, true)));
  return result[0]?.value ?? 0;
}

export async function getMoodEntryCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(moodEntry)
    .where(eq(moodEntry.userId, userId));
  return result?.value ?? 0;
}

export async function getUniqueMoodCategoriesCount(
  userId: string,
): Promise<number> {
  const result = await db
    .selectDistinct({ category: moodEntry.moodCategory })
    .from(moodEntry)
    .where(eq(moodEntry.userId, userId));
  return result.length;
}

import type { AchievementQueryFn } from "@/application/ports/achievement-query.provider.port";

export function getQueryForField(field: string): AchievementQueryFn | null {
  switch (field) {
    case "journalStreak":
      return getJournalStreakDays;
    case "moodStreak":
      return getMoodStreakDays;
    case "count":
      return null;
    case "uniqueMoodCategories":
      return getUniqueMoodCategoriesCount;
    default:
      return null;
  }
}

export function getCountQueryForEventType(
  eventType: string,
): AchievementQueryFn | null {
  switch (eventType) {
    case "PostCreated":
      return getPostCount;
    case "MoodRecorded":
      return getMoodEntryCount;
    case "PhotoUploaded":
      return getPhotoCount;
    case "MoodboardCreated":
      return getMoodboardCount;
    case "FriendRequestAccepted":
      return getFriendCount;
    case "CardCompleted":
      return getCompletedCardCount;
    default:
      return null;
  }
}
