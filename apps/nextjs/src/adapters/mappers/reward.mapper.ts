import { Result, UUID } from "@packages/ddd-kit";
import type {
  achievementDefinition as achievementDefinitionTable,
  userReward as userRewardTable,
} from "@packages/drizzle/schema";
import type { IAchievementDefinitionRecord } from "@/application/ports/reward-repository.port";
import { RewardId } from "@/domain/reward/reward-id";
import { UserReward } from "@/domain/reward/user-reward.aggregate";
import { AchievementType } from "@/domain/reward/value-objects/achievement-type.vo";

type UserRewardRecord = typeof userRewardTable.$inferSelect;
type AchievementDefinitionRow = typeof achievementDefinitionTable.$inferSelect;

type UserRewardPersistence = Omit<UserRewardRecord, "earnedAt"> & {
  earnedAt?: Date;
};

export function userRewardToDomain(
  record: UserRewardRecord,
  definition: AchievementDefinitionRow,
): Result<UserReward> {
  const typeResult = AchievementType.create(
    definition.type as "sticker" | "badge",
  );
  if (typeResult.isFailure) {
    return Result.fail(typeResult.getError());
  }

  const reward = UserReward.reconstitute(
    {
      userId: record.userId,
      achievementDefinitionId: record.achievementDefinitionId,
      achievementType: typeResult.getValue() as AchievementType,
      achievementKey: definition.key,
      earnedAt: record.earnedAt,
    },
    RewardId.create(new UUID(record.id)),
  );

  return Result.ok(reward);
}

export function userRewardToPersistence(
  reward: UserReward,
): UserRewardPersistence {
  return {
    id: reward.id.value.toString(),
    userId: reward.get("userId"),
    achievementDefinitionId: reward.get("achievementDefinitionId"),
    earnedAt: reward.get("earnedAt"),
  };
}

export function definitionToDomain(
  row: AchievementDefinitionRow,
): IAchievementDefinitionRecord {
  return {
    id: row.id,
    type: row.type as "sticker" | "badge",
    key: row.key,
    name: row.name,
    description: row.description,
    criteria: row.criteria as {
      eventType: string;
      threshold: number;
      field: string;
    },
    iconUrl: row.iconUrl,
    createdAt: row.createdAt,
  };
}
