import { db } from "@packages/drizzle";
import { profile } from "@packages/drizzle/schema";
import { inArray } from "drizzle-orm";

export async function getProfileNames(
  userIds: string[],
): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();

  const profiles = await db
    .select({
      userId: profile.userId,
      displayName: profile.displayName,
    })
    .from(profile)
    .where(inArray(profile.userId, userIds));

  return new Map(profiles.map((p) => [p.userId, p.displayName]));
}
