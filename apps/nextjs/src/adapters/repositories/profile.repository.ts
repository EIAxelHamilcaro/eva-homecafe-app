import {
  createPaginatedResult,
  DEFAULT_PAGINATION,
  Option,
  type PaginatedResult,
  type PaginationParams,
  Result,
} from "@packages/ddd-kit";
import { type DbClient, db, eq, type Transaction } from "@packages/drizzle";
import { profile as profileTable } from "@packages/drizzle/schema";
import {
  profileToDomain,
  profileToPersistence,
} from "@/adapters/mappers/profile.mapper";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { Profile } from "@/domain/profile/profile.aggregate";
import type { ProfileId } from "@/domain/profile/profile-id";

export class DrizzleProfileRepository implements IProfileRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(entity: Profile, trx?: Transaction): Promise<Result<Profile>> {
    try {
      const data = profileToPersistence(entity);
      await this.getDb(trx)
        .insert(profileTable)
        .values({
          ...data,
          createdAt: data.createdAt ?? new Date(),
          updatedAt: data.updatedAt ?? new Date(),
        });
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create profile: ${error}`);
    }
  }

  async update(entity: Profile, trx?: Transaction): Promise<Result<Profile>> {
    try {
      const data = profileToPersistence(entity);
      await this.getDb(trx)
        .update(profileTable)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(profileTable.id, String(entity.id.value)));
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update profile: ${error}`);
    }
  }

  async delete(id: ProfileId, trx?: Transaction): Promise<Result<ProfileId>> {
    try {
      await this.getDb(trx)
        .delete(profileTable)
        .where(eq(profileTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete profile: ${error}`);
    }
  }

  async findById(id: ProfileId): Promise<Result<Option<Profile>>> {
    try {
      const result = await db
        .select()
        .from(profileTable)
        .where(eq(profileTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const profileResult = profileToDomain(record);
      if (profileResult.isFailure) {
        return Result.fail(profileResult.getError());
      }

      return Result.ok(Option.some(profileResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find profile by id: ${error}`);
    }
  }

  async findByUserId(userId: string): Promise<Result<Option<Profile>>> {
    try {
      const result = await db
        .select()
        .from(profileTable)
        .where(eq(profileTable.userId, userId))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const profileResult = profileToDomain(record);
      if (profileResult.isFailure) {
        return Result.fail(profileResult.getError());
      }

      return Result.ok(Option.some(profileResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find profile by userId: ${error}`);
    }
  }

  async existsByUserId(userId: string): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: profileTable.id })
        .from(profileTable)
        .where(eq(profileTable.userId, userId))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(
        `Failed to check profile existence by userId: ${error}`,
      );
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Profile>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db.select().from(profileTable).limit(pagination.limit).offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const profiles: Profile[] = [];
      for (const record of records) {
        const profileResult = profileToDomain(record);
        if (profileResult.isFailure) {
          return Result.fail(profileResult.getError());
        }
        profiles.push(profileResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(profiles, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(`Failed to find all profiles: ${error}`);
    }
  }

  async findMany(
    props: Partial<Profile["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Profile>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return this.findAll(pagination);
      }

      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(profileTable)
        .where(eq(profileTable.userId, userId))
        .limit(pagination.limit)
        .offset(offset);

      const profiles: Profile[] = [];
      for (const record of records) {
        const profileResult = profileToDomain(record);
        if (profileResult.isFailure) {
          return Result.fail(profileResult.getError());
        }
        profiles.push(profileResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(profiles, pagination, profiles.length),
      );
    } catch (error) {
      return Result.fail(`Failed to find profiles: ${error}`);
    }
  }

  async findBy(
    props: Partial<Profile["_props"]>,
  ): Promise<Result<Option<Profile>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return Result.ok(Option.none());
      }
      return this.findByUserId(userId);
    } catch (error) {
      return Result.fail(`Failed to find profile: ${error}`);
    }
  }

  async exists(id: ProfileId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: profileTable.id })
        .from(profileTable)
        .where(eq(profileTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check profile existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const result = await db.select().from(profileTable);
      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(`Failed to count profiles: ${error}`);
    }
  }
}
