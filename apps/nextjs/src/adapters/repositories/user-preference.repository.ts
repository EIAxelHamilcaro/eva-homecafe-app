import {
  createPaginatedResult,
  DEFAULT_PAGINATION,
  Option,
  type PaginatedResult,
  type PaginationParams,
  Result,
} from "@packages/ddd-kit";
import { type DbClient, db, eq, type Transaction } from "@packages/drizzle";
import { userPreference as userPreferenceTable } from "@packages/drizzle/schema";
import {
  userPreferenceToDomain,
  userPreferenceToPersistence,
} from "@/adapters/mappers/user-preference.mapper";
import type { IUserPreferenceRepository } from "@/application/ports/user-preference-repository.port";
import type { UserPreference } from "@/domain/user-preference/user-preference.aggregate";
import type { UserPreferenceId } from "@/domain/user-preference/user-preference-id";

export class DrizzleUserPreferenceRepository
  implements IUserPreferenceRepository
{
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(
    entity: UserPreference,
    trx?: Transaction,
  ): Promise<Result<UserPreference>> {
    try {
      const data = userPreferenceToPersistence(entity);
      await this.getDb(trx)
        .insert(userPreferenceTable)
        .values({
          ...data,
          createdAt: data.createdAt ?? new Date(),
          updatedAt: data.updatedAt ?? new Date(),
        });
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create user preference: ${error}`);
    }
  }

  async update(
    entity: UserPreference,
    trx?: Transaction,
  ): Promise<Result<UserPreference>> {
    try {
      const data = userPreferenceToPersistence(entity);
      await this.getDb(trx)
        .update(userPreferenceTable)
        .set({
          emailNotifications: data.emailNotifications,
          pushNotifications: data.pushNotifications,
          notifyNewMessages: data.notifyNewMessages,
          notifyFriendActivity: data.notifyFriendActivity,
          notifyBadgesEarned: data.notifyBadgesEarned,
          notifyJournalReminder: data.notifyJournalReminder,
          profileVisibility: data.profileVisibility,
          rewardsVisibility: data.rewardsVisibility,
          themeMode: data.themeMode,
          language: data.language,
          timeFormat: data.timeFormat,
          updatedAt: data.updatedAt ?? new Date(),
        })
        .where(eq(userPreferenceTable.id, String(entity.id.value)));
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update user preference: ${error}`);
    }
  }

  async delete(
    id: UserPreferenceId,
    trx?: Transaction,
  ): Promise<Result<UserPreferenceId>> {
    try {
      await this.getDb(trx)
        .delete(userPreferenceTable)
        .where(eq(userPreferenceTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete user preference: ${error}`);
    }
  }

  async findById(
    id: UserPreferenceId,
  ): Promise<Result<Option<UserPreference>>> {
    try {
      const result = await db
        .select()
        .from(userPreferenceTable)
        .where(eq(userPreferenceTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const domainResult = userPreferenceToDomain(record);
      if (domainResult.isFailure) {
        return Result.fail(domainResult.getError());
      }

      return Result.ok(Option.some(domainResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find user preference by id: ${error}`);
    }
  }

  async findByUserId(userId: string): Promise<Result<Option<UserPreference>>> {
    try {
      const result = await db
        .select()
        .from(userPreferenceTable)
        .where(eq(userPreferenceTable.userId, userId))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const domainResult = userPreferenceToDomain(record);
      if (domainResult.isFailure) {
        return Result.fail(domainResult.getError());
      }

      return Result.ok(Option.some(domainResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find user preference by userId: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<UserPreference>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db
          .select()
          .from(userPreferenceTable)
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const preferences: UserPreference[] = [];
      for (const record of records) {
        const domainResult = userPreferenceToDomain(record);
        if (domainResult.isFailure) {
          return Result.fail(domainResult.getError());
        }
        preferences.push(domainResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(preferences, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(`Failed to find all user preferences: ${error}`);
    }
  }

  async findMany(
    props: Partial<UserPreference["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<UserPreference>>> {
    try {
      const userId = props.userId;

      if (!userId) {
        return this.findAll(pagination);
      }

      const findResult = await this.findByUserId(userId);
      if (findResult.isFailure) {
        return Result.fail(findResult.getError());
      }

      const option = findResult.getValue();
      const data = option.isSome() ? [option.unwrap()] : [];
      return Result.ok(createPaginatedResult(data, pagination, data.length));
    } catch (error) {
      return Result.fail(`Failed to find user preferences: ${error}`);
    }
  }

  async findBy(
    props: Partial<UserPreference["_props"]>,
  ): Promise<Result<Option<UserPreference>>> {
    try {
      const userId = props.userId;

      if (!userId) {
        return Result.ok(Option.none());
      }

      return this.findByUserId(userId);
    } catch (error) {
      return Result.fail(`Failed to find user preference: ${error}`);
    }
  }

  async exists(id: UserPreferenceId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: userPreferenceTable.id })
        .from(userPreferenceTable)
        .where(eq(userPreferenceTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check user preference existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const result = await db.select().from(userPreferenceTable);
      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(`Failed to count user preferences: ${error}`);
    }
  }
}
