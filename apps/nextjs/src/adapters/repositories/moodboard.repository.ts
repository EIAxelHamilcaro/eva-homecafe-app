import {
  createPaginatedResult,
  DEFAULT_PAGINATION,
  Option,
  type PaginatedResult,
  type PaginationParams,
  Result,
} from "@packages/ddd-kit";
import {
  type DbClient,
  db,
  desc,
  eq,
  inArray,
  count as sqlCount,
  type Transaction,
} from "@packages/drizzle";
import {
  moodboard as moodboardTable,
  pin as pinTable,
} from "@packages/drizzle/schema";
import {
  moodboardToDomain,
  moodboardToPersistence,
  pinToPersistence,
} from "@/adapters/mappers/moodboard.mapper";
import type { IMoodboardRepository } from "@/application/ports/moodboard-repository.port";
import type { Moodboard } from "@/domain/moodboard/moodboard.aggregate";
import type { MoodboardId } from "@/domain/moodboard/moodboard-id";

export class DrizzleMoodboardRepository implements IMoodboardRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(
    entity: Moodboard,
    trx?: Transaction,
  ): Promise<Result<Moodboard>> {
    try {
      const data = moodboardToPersistence(entity);
      await this.getDb(trx)
        .insert(moodboardTable)
        .values({
          ...data,
          createdAt: data.createdAt ?? new Date(),
        });
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create moodboard: ${error}`);
    }
  }

  async update(
    entity: Moodboard,
    trx?: Transaction,
  ): Promise<Result<Moodboard>> {
    try {
      const moodboardId = String(entity.id.value);
      const data = moodboardToPersistence(entity);

      const performUpdate = async (client: DbClient | Transaction) => {
        await client
          .update(moodboardTable)
          .set({
            title: data.title,
            updatedAt: new Date(),
          })
          .where(eq(moodboardTable.id, moodboardId));

        await client
          .delete(pinTable)
          .where(eq(pinTable.moodboardId, moodboardId));

        const pins = entity.get("pins");
        if (pins.length > 0) {
          const pinRows = pins.map((pin) => pinToPersistence(pin, moodboardId));
          await client.insert(pinTable).values(
            pinRows.map((p) => ({
              ...p,
              createdAt: p.createdAt ?? new Date(),
            })),
          );
        }
      };

      if (trx) {
        await performUpdate(trx);
      } else {
        await db.transaction(async (tx) => {
          await performUpdate(tx);
        });
      }

      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update moodboard: ${error}`);
    }
  }

  async delete(
    id: MoodboardId,
    trx?: Transaction,
  ): Promise<Result<MoodboardId>> {
    try {
      await this.getDb(trx)
        .delete(moodboardTable)
        .where(eq(moodboardTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete moodboard: ${error}`);
    }
  }

  async findById(id: MoodboardId): Promise<Result<Option<Moodboard>>> {
    try {
      const result = await db
        .select()
        .from(moodboardTable)
        .where(eq(moodboardTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const pinRecords = await db
        .select()
        .from(pinTable)
        .where(eq(pinTable.moodboardId, record.id))
        .orderBy(pinTable.position);

      const moodboardResult = moodboardToDomain(record, pinRecords);
      if (moodboardResult.isFailure) {
        return Result.fail(moodboardResult.getError());
      }

      return Result.ok(Option.some(moodboardResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find moodboard by id: ${error}`);
    }
  }

  async findByUserId(
    userId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Moodboard>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(moodboardTable)
        .where(eq(moodboardTable.userId, userId))
        .orderBy(desc(moodboardTable.createdAt))
        .limit(pagination.limit)
        .offset(offset);

      const [countRow] = await db
        .select({ value: sqlCount() })
        .from(moodboardTable)
        .where(eq(moodboardTable.userId, userId));

      const moodboardIds = records.map((r) => r.id);
      const pinRecords =
        moodboardIds.length > 0
          ? await db
              .select()
              .from(pinTable)
              .where(inArray(pinTable.moodboardId, moodboardIds))
              .orderBy(pinTable.position)
          : [];

      const pinsByMoodboard = new Map<string, (typeof pinRecords)[number][]>();
      for (const p of pinRecords) {
        const existing = pinsByMoodboard.get(p.moodboardId) ?? [];
        existing.push(p);
        pinsByMoodboard.set(p.moodboardId, existing);
      }

      const moodboards: Moodboard[] = [];
      for (const record of records) {
        const moodboardResult = moodboardToDomain(
          record,
          pinsByMoodboard.get(record.id) ?? [],
        );
        if (moodboardResult.isFailure) {
          return Result.fail(moodboardResult.getError());
        }
        moodboards.push(moodboardResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(moodboards, pagination, countRow?.value ?? 0),
      );
    } catch (error) {
      return Result.fail(`Failed to find moodboards for user: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Moodboard>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db
          .select()
          .from(moodboardTable)
          .orderBy(desc(moodboardTable.createdAt))
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const moodboardIds = records.map((r) => r.id);
      const pinRecords =
        moodboardIds.length > 0
          ? await db
              .select()
              .from(pinTable)
              .where(inArray(pinTable.moodboardId, moodboardIds))
              .orderBy(pinTable.position)
          : [];

      const pinsByMoodboard = new Map<string, (typeof pinRecords)[number][]>();
      for (const p of pinRecords) {
        const existing = pinsByMoodboard.get(p.moodboardId) ?? [];
        existing.push(p);
        pinsByMoodboard.set(p.moodboardId, existing);
      }

      const moodboards: Moodboard[] = [];
      for (const record of records) {
        const moodboardResult = moodboardToDomain(
          record,
          pinsByMoodboard.get(record.id) ?? [],
        );
        if (moodboardResult.isFailure) {
          return Result.fail(moodboardResult.getError());
        }
        moodboards.push(moodboardResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(moodboards, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(`Failed to find all moodboards: ${error}`);
    }
  }

  async findMany(
    props: Partial<Moodboard["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Moodboard>>> {
    try {
      const userId = props.userId;

      if (!userId) {
        return this.findAll(pagination);
      }

      return this.findByUserId(userId, pagination);
    } catch (error) {
      return Result.fail(`Failed to find moodboards: ${error}`);
    }
  }

  async findBy(
    props: Partial<Moodboard["_props"]>,
  ): Promise<Result<Option<Moodboard>>> {
    try {
      const userId = props.userId;

      if (!userId) {
        return Result.ok(Option.none());
      }

      const result = await db
        .select()
        .from(moodboardTable)
        .where(eq(moodboardTable.userId, userId))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const pinRecords = await db
        .select()
        .from(pinTable)
        .where(eq(pinTable.moodboardId, record.id))
        .orderBy(pinTable.position);

      const moodboardResult = moodboardToDomain(record, pinRecords);
      if (moodboardResult.isFailure) {
        return Result.fail(moodboardResult.getError());
      }

      return Result.ok(Option.some(moodboardResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find moodboard: ${error}`);
    }
  }

  async exists(id: MoodboardId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: moodboardTable.id })
        .from(moodboardTable)
        .where(eq(moodboardTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check moodboard existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const [result] = await db
        .select({ value: sqlCount() })
        .from(moodboardTable);
      return Result.ok(result?.value ?? 0);
    } catch (error) {
      return Result.fail(`Failed to count moodboards: ${error}`);
    }
  }
}
