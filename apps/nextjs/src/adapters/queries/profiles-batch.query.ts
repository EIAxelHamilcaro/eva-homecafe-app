import { db } from "@packages/drizzle";
import { profile } from "@packages/drizzle/schema";
import { inArray } from "drizzle-orm";

export interface ProfileBatchResult {
  id: string;
  name: string;
  image: string | null;
}

export async function getProfilesBatch(
  userIds: string[],
): Promise<ProfileBatchResult[]> {
  if (userIds.length === 0) return [];

  const profiles = await db
    .select({
      userId: profile.userId,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    })
    .from(profile)
    .where(inArray(profile.userId, userIds));

  return profiles.map((p) => ({
    id: p.userId,
    name: p.displayName,
    image: p.avatarUrl,
  }));
}
