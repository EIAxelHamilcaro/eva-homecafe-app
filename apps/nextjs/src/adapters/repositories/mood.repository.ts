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
import { moodEntry as moodEntryTable } from "@packages/drizzle/schema";
import {
  moodEntryToDomain,
  moodEntryToPersistence,
} from "@/adapters/mappers/mood.mapper";
import type { IMoodRepository } from "@/application/ports/mood-repository.port";
import type { MoodEntry } from "@/domain/mood/mood-entry.aggregate";
import type { MoodEntryId } from "@/domain/mood/mood-entry-id";

export class DrizzleMoodRepository implements IMoodRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(
    entity: MoodEntry,
    trx?: Transaction,
  ): Promise<Result<MoodEntry>> {
    try {
      const data = moodEntryToPersistence(entity);
      await this.getDb(trx).insert(moodEntryTable).values(data);
      return Result.ok(entity);
    } catch (error) {
      if (String(error).includes("mood_entry_user_id_mood_date_uniq")) {
        return Result.fail("A mood entry already exists for today");
      }
      return Result.fail(`Failed to create mood entry: ${error}`);
    }
  }

  async update(
    entity: MoodEntry,
    trx?: Transaction,
  ): Promise<Result<MoodEntry>> {
    try {
      const data = moodEntryToPersistence(entity);
      await this.getDb(trx)
        .update(moodEntryTable)
        .set({
          moodCategory: data.moodCategory,
          moodIntensity: data.moodIntensity,
          updatedAt: data.updatedAt ?? new Date(),
        })
        .where(eq(moodEntryTable.id, data.id));
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update mood entry: ${error}`);
    }
  }

  async delete(
    id: MoodEntryId,
    trx?: Transaction,
  ): Promise<Result<MoodEntryId>> {
    try {
      await this.getDb(trx)
        .delete(moodEntryTable)
        .where(eq(moodEntryTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete mood entry: ${error}`);
    }
  }

  async findById(id: MoodEntryId): Promise<Result<Option<MoodEntry>>> {
    try {
      const result = await db
        .select()
        .from(moodEntryTable)
        .where(eq(moodEntryTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const entryResult = moodEntryToDomain(record);
      if (entryResult.isFailure) {
        return Result.fail(entryResult.getError());
      }

      return Result.ok(Option.some(entryResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find mood entry by id: ${error}`);
    }
  }

  async findTodayByUserId(userId: string): Promise<Result<Option<MoodEntry>>> {
    try {
      const result = await db
        .select()
        .from(moodEntryTable)
        .where(
          and(
            eq(moodEntryTable.userId, userId),
            eq(moodEntryTable.moodDate, sql`CURRENT_DATE`),
          ),
        )
        .orderBy(desc(moodEntryTable.createdAt))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const entryResult = moodEntryToDomain(record);
      if (entryResult.isFailure) {
        return Result.fail(entryResult.getError());
      }

      return Result.ok(Option.some(entryResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find today's mood entry: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<MoodEntry>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db
          .select()
          .from(moodEntryTable)
          .orderBy(desc(moodEntryTable.createdAt))
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const entries: MoodEntry[] = [];
      for (const record of records) {
        const entryResult = moodEntryToDomain(record);
        if (entryResult.isFailure) {
          return Result.fail(entryResult.getError());
        }
        entries.push(entryResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(entries, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(`Failed to find all mood entries: ${error}`);
    }
  }

  async findMany(
    props: Partial<MoodEntry["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<MoodEntry>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return this.findAll(pagination);
      }

      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(moodEntryTable)
        .where(eq(moodEntryTable.userId, userId))
        .orderBy(desc(moodEntryTable.createdAt))
        .limit(pagination.limit)
        .offset(offset);

      const [countRow] = await db
        .select({ value: sqlCount() })
        .from(moodEntryTable)
        .where(eq(moodEntryTable.userId, userId));

      const entries: MoodEntry[] = [];
      for (const record of records) {
        const entryResult = moodEntryToDomain(record);
        if (entryResult.isFailure) {
          return Result.fail(entryResult.getError());
        }
        entries.push(entryResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(entries, pagination, countRow?.value ?? 0),
      );
    } catch (error) {
      return Result.fail(`Failed to find mood entries: ${error}`);
    }
  }

  async findBy(
    props: Partial<MoodEntry["_props"]>,
  ): Promise<Result<Option<MoodEntry>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return Result.ok(Option.none());
      }

      const result = await db
        .select()
        .from(moodEntryTable)
        .where(eq(moodEntryTable.userId, userId))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const entryResult = moodEntryToDomain(record);
      if (entryResult.isFailure) {
        return Result.fail(entryResult.getError());
      }

      return Result.ok(Option.some(entryResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find mood entry: ${error}`);
    }
  }

  async exists(id: MoodEntryId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: moodEntryTable.id })
        .from(moodEntryTable)
        .where(eq(moodEntryTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check mood entry existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const [result] = await db
        .select({ value: sqlCount() })
        .from(moodEntryTable);
      return Result.ok(result?.value ?? 0);
    } catch (error) {
      return Result.fail(`Failed to count mood entries: ${error}`);
    }
  }
}
