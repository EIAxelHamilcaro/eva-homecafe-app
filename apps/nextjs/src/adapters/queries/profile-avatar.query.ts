import { db } from "@packages/drizzle";
import { profile } from "@packages/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getProfileAvatarUrl(
  userId: string,
): Promise<string | null> {
  const result = await db
    .select({ avatarUrl: profile.avatarUrl })
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1);

  return result[0]?.avatarUrl ?? null;
}
