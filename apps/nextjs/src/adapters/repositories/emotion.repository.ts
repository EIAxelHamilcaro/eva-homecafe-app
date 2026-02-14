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
  count as sqlCount,
  type Transaction,
} from "@packages/drizzle";
import { emotionEntry as emotionEntryTable } from "@packages/drizzle/schema";
import {
  emotionEntryToDomain,
  emotionEntryToPersistence,
} from "@/adapters/mappers/emotion.mapper";
import type { IEmotionRepository } from "@/application/ports/emotion-repository.port";
import type { EmotionEntry } from "@/domain/emotion/emotion-entry.aggregate";
import type { EmotionEntryId } from "@/domain/emotion/emotion-entry-id";

export class DrizzleEmotionRepository implements IEmotionRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(
    entity: EmotionEntry,
    trx?: Transaction,
  ): Promise<Result<EmotionEntry>> {
    try {
      const data = emotionEntryToPersistence(entity);
      await this.getDb(trx).insert(emotionEntryTable).values(data);
      return Result.ok(entity);
    } catch (error) {
      if (String(error).includes("emotion_entry_user_id_emotion_date_uniq")) {
        return Result.fail("An emotion entry already exists for this date");
      }
      return Result.fail(`Failed to create emotion entry: ${error}`);
    }
  }

  async update(
    entity: EmotionEntry,
    trx?: Transaction,
  ): Promise<Result<EmotionEntry>> {
    try {
      const data = emotionEntryToPersistence(entity);
      await this.getDb(trx)
        .update(emotionEntryTable)
        .set({
          emotionCategory: data.emotionCategory,
          updatedAt: data.updatedAt ?? new Date(),
        })
        .where(eq(emotionEntryTable.id, data.id));
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update emotion entry: ${error}`);
    }
  }

  async delete(
    id: EmotionEntryId,
    trx?: Transaction,
  ): Promise<Result<EmotionEntryId>> {
    try {
      await this.getDb(trx)
        .delete(emotionEntryTable)
        .where(eq(emotionEntryTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete emotion entry: ${error}`);
    }
  }

  async findById(id: EmotionEntryId): Promise<Result<Option<EmotionEntry>>> {
    try {
      const result = await db
        .select()
        .from(emotionEntryTable)
        .where(eq(emotionEntryTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const entryResult = emotionEntryToDomain(record);
      if (entryResult.isFailure) {
        return Result.fail(entryResult.getError());
      }

      return Result.ok(Option.some(entryResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find emotion entry by id: ${error}`);
    }
  }

  async findByUserIdAndDate(
    userId: string,
    date: string,
  ): Promise<Result<Option<EmotionEntry>>> {
    try {
      const result = await db
        .select()
        .from(emotionEntryTable)
        .where(
          and(
            eq(emotionEntryTable.userId, userId),
            eq(emotionEntryTable.emotionDate, date),
          ),
        )
        .orderBy(desc(emotionEntryTable.createdAt))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const entryResult = emotionEntryToDomain(record);
      if (entryResult.isFailure) {
        return Result.fail(entryResult.getError());
      }

      return Result.ok(Option.some(entryResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find emotion entry by date: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<EmotionEntry>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db
          .select()
          .from(emotionEntryTable)
          .orderBy(desc(emotionEntryTable.createdAt))
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const entries: EmotionEntry[] = [];
      for (const record of records) {
        const entryResult = emotionEntryToDomain(record);
        if (entryResult.isFailure) {
          return Result.fail(entryResult.getError());
        }
        entries.push(entryResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(entries, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(`Failed to find all emotion entries: ${error}`);
    }
  }

  async findMany(
    props: Partial<EmotionEntry["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<EmotionEntry>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return this.findAll(pagination);
      }

      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(emotionEntryTable)
        .where(eq(emotionEntryTable.userId, userId))
        .orderBy(desc(emotionEntryTable.createdAt))
        .limit(pagination.limit)
        .offset(offset);

      const [countRow] = await db
        .select({ value: sqlCount() })
        .from(emotionEntryTable)
        .where(eq(emotionEntryTable.userId, userId));

      const entries: EmotionEntry[] = [];
      for (const record of records) {
        const entryResult = emotionEntryToDomain(record);
        if (entryResult.isFailure) {
          return Result.fail(entryResult.getError());
        }
        entries.push(entryResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(entries, pagination, countRow?.value ?? 0),
      );
    } catch (error) {
      return Result.fail(`Failed to find emotion entries: ${error}`);
    }
  }

  async findBy(
    props: Partial<EmotionEntry["_props"]>,
  ): Promise<Result<Option<EmotionEntry>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return Result.ok(Option.none());
      }

      const result = await db
        .select()
        .from(emotionEntryTable)
        .where(eq(emotionEntryTable.userId, userId))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const entryResult = emotionEntryToDomain(record);
      if (entryResult.isFailure) {
        return Result.fail(entryResult.getError());
      }

      return Result.ok(Option.some(entryResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find emotion entry: ${error}`);
    }
  }

  async exists(id: EmotionEntryId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: emotionEntryTable.id })
        .from(emotionEntryTable)
        .where(eq(emotionEntryTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check emotion entry existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const [result] = await db
        .select({ value: sqlCount() })
        .from(emotionEntryTable);
      return Result.ok(result?.value ?? 0);
    } catch (error) {
      return Result.fail(`Failed to count emotion entries: ${error}`);
    }
  }
}
