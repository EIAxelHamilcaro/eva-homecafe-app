import {
  createPaginatedResult,
  DEFAULT_PAGINATION,
  Option,
  type PaginatedResult,
  type PaginationParams,
  Result,
} from "@packages/ddd-kit";
import {
  and,
  type DbClient,
  db,
  desc,
  eq,
  sql,
  count as sqlCount,
  type Transaction,
} from "@packages/drizzle";
import {
  achievementDefinition,
  userReward as userRewardTable,
} from "@packages/drizzle/schema";
import {
  definitionToDomain,
  userRewardToDomain,
  userRewardToPersistence,
} from "@/adapters/mappers/reward.mapper";
import type {
  IAchievementDefinitionRecord,
  IRewardRepository,
} from "@/application/ports/reward-repository.port";
import type { RewardId } from "@/domain/reward/reward-id";
import type { UserReward } from "@/domain/reward/user-reward.aggregate";

export class DrizzleRewardRepository implements IRewardRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(
    entity: UserReward,
    trx?: Transaction,
  ): Promise<Result<UserReward>> {
    try {
      const data = userRewardToPersistence(entity);
      await this.getDb(trx)
        .insert(userRewardTable)
        .values({
          ...data,
          earnedAt: data.earnedAt ?? new Date(),
        });
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create user reward: ${error}`);
    }
  }

  async update(
    _entity: UserReward,
    _trx?: Transaction,
  ): Promise<Result<UserReward>> {
    return Result.fail("UserReward is immutable — update not supported");
  }

  async delete(id: RewardId, trx?: Transaction): Promise<Result<RewardId>> {
    try {
      await this.getDb(trx)
        .delete(userRewardTable)
        .where(eq(userRewardTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete user reward: ${error}`);
    }
  }

  async findById(id: RewardId): Promise<Result<Option<UserReward>>> {
    try {
      const result = await db
        .select()
        .from(userRewardTable)
        .innerJoin(
          achievementDefinition,
          eq(userRewardTable.achievementDefinitionId, achievementDefinition.id),
        )
        .where(eq(userRewardTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const rewardResult = userRewardToDomain(
        record.user_reward,
        record.achievement_definition,
      );
      if (rewardResult.isFailure) {
        return Result.fail(rewardResult.getError());
      }

      return Result.ok(Option.some(rewardResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find reward by id: ${error}`);
    }
  }

  async findByUserId(
    userId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<UserReward>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(userRewardTable)
        .innerJoin(
          achievementDefinition,
          eq(userRewardTable.achievementDefinitionId, achievementDefinition.id),
        )
        .where(eq(userRewardTable.userId, userId))
        .orderBy(desc(userRewardTable.earnedAt))
        .limit(pagination.limit)
        .offset(offset);

      const [countRow] = await db
        .select({ value: sqlCount() })
        .from(userRewardTable)
        .where(eq(userRewardTable.userId, userId));

      const rewards: UserReward[] = [];
      for (const record of records) {
        const rewardResult = userRewardToDomain(
          record.user_reward,
          record.achievement_definition,
        );
        if (rewardResult.isFailure) {
          return Result.fail(rewardResult.getError());
        }
        rewards.push(rewardResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(rewards, pagination, countRow?.value ?? 0),
      );
    } catch (error) {
      return Result.fail(`Failed to find rewards for user: ${error}`);
    }
  }

  async findByUserIdAndDefinitionId(
    userId: string,
    definitionId: string,
  ): Promise<Result<Option<UserReward>>> {
    try {
      const result = await db
        .select()
        .from(userRewardTable)
        .innerJoin(
          achievementDefinition,
          eq(userRewardTable.achievementDefinitionId, achievementDefinition.id),
        )
        .where(
          and(
            eq(userRewardTable.userId, userId),
            eq(userRewardTable.achievementDefinitionId, definitionId),
          ),
        )
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const rewardResult = userRewardToDomain(
        record.user_reward,
        record.achievement_definition,
      );
      if (rewardResult.isFailure) {
        return Result.fail(rewardResult.getError());
      }

      return Result.ok(Option.some(rewardResult.getValue()));
    } catch (error) {
      return Result.fail(
        `Failed to find reward by user and definition: ${error}`,
      );
    }
  }

  async getAllDefinitions(): Promise<Result<IAchievementDefinitionRecord[]>> {
    try {
      const rows = await db.select().from(achievementDefinition);
      return Result.ok(rows.map(definitionToDomain));
    } catch (error) {
      return Result.fail(`Failed to get all definitions: ${error}`);
    }
  }

  async getDefinitionsByType(
    type: "sticker" | "badge",
  ): Promise<Result<IAchievementDefinitionRecord[]>> {
    try {
      const rows = await db
        .select()
        .from(achievementDefinition)
        .where(eq(achievementDefinition.type, type));
      return Result.ok(rows.map(definitionToDomain));
    } catch (error) {
      return Result.fail(`Failed to get definitions by type: ${error}`);
    }
  }

  async getDefinitionsByEventType(
    eventType: string,
  ): Promise<Result<IAchievementDefinitionRecord[]>> {
    try {
      const rows = await db
        .select()
        .from(achievementDefinition)
        .where(
          sql`${achievementDefinition.criteria}->>'eventType' = ${eventType}`,
        );
      return Result.ok(rows.map(definitionToDomain));
    } catch (error) {
      return Result.fail(`Failed to get definitions by event type: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<UserReward>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(userRewardTable)
        .innerJoin(
          achievementDefinition,
          eq(userRewardTable.achievementDefinitionId, achievementDefinition.id),
        )
        .orderBy(desc(userRewardTable.earnedAt))
        .limit(pagination.limit)
        .offset(offset);

      const [countRow] = await db
        .select({ value: sqlCount() })
        .from(userRewardTable);

      const rewards: UserReward[] = [];
      for (const record of records) {
        const rewardResult = userRewardToDomain(
          record.user_reward,
          record.achievement_definition,
        );
        if (rewardResult.isFailure) {
          return Result.fail(rewardResult.getError());
        }
        rewards.push(rewardResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(rewards, pagination, countRow?.value ?? 0),
      );
    } catch (error) {
      return Result.fail(`Failed to find all rewards: ${error}`);
    }
  }

  async findMany(
    props: Partial<UserReward["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<UserReward>>> {
    const userId = props.userId;
    if (!userId) {
      return this.findAll(pagination);
    }
    return this.findByUserId(userId, pagination);
  }

  async findBy(
    props: Partial<UserReward["_props"]>,
  ): Promise<Result<Option<UserReward>>> {
    const userId = props.userId;
    const defId = props.achievementDefinitionId;
    if (userId && defId) {
      return this.findByUserIdAndDefinitionId(userId, defId);
    }
    return Result.ok(Option.none());
  }

  async exists(id: RewardId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: userRewardTable.id })
        .from(userRewardTable)
        .where(eq(userRewardTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check reward existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const [result] = await db
        .select({ value: sqlCount() })
        .from(userRewardTable);
      return Result.ok(result?.value ?? 0);
    } catch (error) {
      return Result.fail(`Failed to count rewards: ${error}`);
    }
  }
}
