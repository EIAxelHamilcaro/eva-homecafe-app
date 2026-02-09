import { db } from "@packages/drizzle";
import { achievementDefinition, userReward } from "@packages/drizzle/schema";
import { and, asc, desc, eq, sql } from "drizzle-orm";

export interface RewardCollectionItemDto {
  id: string;
  key: string;
  name: string;
  description: string;
  criteria: {
    eventType: string;
    threshold: number;
    field: string;
  };
  iconUrl: string | null;
  earned: boolean;
  earnedAt: string | null;
}

export async function getUserStickerCollection(
  userId: string,
): Promise<RewardCollectionItemDto[]> {
  return getCollectionByType(userId, "sticker");
}

export async function getUserBadgeCollection(
  userId: string,
): Promise<RewardCollectionItemDto[]> {
  return getCollectionByType(userId, "badge");
}

async function getCollectionByType(
  userId: string,
  type: "sticker" | "badge",
): Promise<RewardCollectionItemDto[]> {
  const result = await db
    .select({
      id: achievementDefinition.id,
      key: achievementDefinition.key,
      name: achievementDefinition.name,
      description: achievementDefinition.description,
      criteria: achievementDefinition.criteria,
      iconUrl: achievementDefinition.iconUrl,
      earnedAt: userReward.earnedAt,
    })
    .from(achievementDefinition)
    .leftJoin(
      userReward,
      and(
        eq(achievementDefinition.id, userReward.achievementDefinitionId),
        eq(userReward.userId, userId),
      ),
    )
    .where(eq(achievementDefinition.type, type))
    .orderBy(
      desc(sql`CASE WHEN ${userReward.earnedAt} IS NOT NULL THEN 1 ELSE 0 END`),
      asc(achievementDefinition.createdAt),
    );

  return result.map((row) => ({
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    criteria: row.criteria as {
      eventType: string;
      threshold: number;
      field: string;
    },
    iconUrl: row.iconUrl,
    earned: row.earnedAt !== null,
    earnedAt: row.earnedAt?.toISOString() ?? null,
  }));
}
