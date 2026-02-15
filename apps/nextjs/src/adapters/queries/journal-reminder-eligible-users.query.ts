import { db, post, user, userPreference } from "@packages/drizzle";
import { and, eq, gte, isNotNull, lt, notInArray } from "drizzle-orm";
import type { IJournalReminderEligibleUser } from "@/application/ports/journal-reminder-query.provider.port";

export async function getJournalReminderEligibleUsers(): Promise<
  IJournalReminderEligibleUser[]
> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const usersWhoPostedToday = db
    .select({ userId: post.userId })
    .from(post)
    .where(and(gte(post.createdAt, todayStart), lt(post.createdAt, todayEnd)));

  const eligibleUsers = await db
    .select({ userId: user.id })
    .from(user)
    .innerJoin(userPreference, eq(user.id, userPreference.userId))
    .where(
      and(
        eq(userPreference.notifyJournalReminder, true),
        isNotNull(user.emailVerified),
        notInArray(user.id, usersWhoPostedToday),
      ),
    );

  return eligibleUsers;
}
