import {
  createPaginatedResult,
  DEFAULT_PAGINATION,
  Option,
  type PaginatedResult,
  type PaginationParams,
  Result,
} from "@packages/ddd-kit";
import {
  asc,
  type DbClient,
  db,
  eq,
  inArray,
  count as sqlCount,
  type Transaction,
} from "@packages/drizzle";
import {
  chronologieEntry as chronologieEntryTable,
  chronologie as chronologieTable,
} from "@packages/drizzle/schema";
import {
  chronologieToDomain,
  chronologieToPersistence,
} from "@/adapters/mappers/chronologie.mapper";
import type { IChronologieRepository } from "@/application/ports/chronologie-repository.port";
import type { Chronologie } from "@/domain/chronologie/chronologie.aggregate";
import type { ChronologieId } from "@/domain/chronologie/chronologie-id";

type ChronologieRecord = typeof chronologieTable.$inferSelect;
type EntryRecord = typeof chronologieEntryTable.$inferSelect;

export class DrizzleChronologieRepository implements IChronologieRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  private async hydrateChronologies(
    chronologieRecords: ChronologieRecord[],
  ): Promise<Result<Chronologie[]>> {
    const chronologieIds = chronologieRecords.map((c) => c.id);

    const entryRecords: EntryRecord[] =
      chronologieIds.length > 0
        ? await db
            .select()
            .from(chronologieEntryTable)
            .where(inArray(chronologieEntryTable.chronologieId, chronologieIds))
            .orderBy(asc(chronologieEntryTable.position))
        : [];

    const entriesByChronologieId = new Map<string, EntryRecord[]>();
    for (const entry of entryRecords) {
      const existing = entriesByChronologieId.get(entry.chronologieId) ?? [];
      existing.push(entry);
      entriesByChronologieId.set(entry.chronologieId, existing);
    }

    const chronologies: Chronologie[] = [];
    for (const chronologieRecord of chronologieRecords) {
      const entries = entriesByChronologieId.get(chronologieRecord.id) ?? [];
      const chronologieResult = chronologieToDomain(chronologieRecord, entries);
      if (chronologieResult.isFailure) {
        return Result.fail(chronologieResult.getError());
      }
      chronologies.push(chronologieResult.getValue());
    }

    return Result.ok(chronologies);
  }

  async create(
    entity: Chronologie,
    trx?: Transaction,
  ): Promise<Result<Chronologie>> {
    try {
      const data = chronologieToPersistence(entity);

      const performCreate = async (database: DbClient | Transaction) => {
        await database.insert(chronologieTable).values(data.chronologie);
        if (data.entries.length > 0) {
          await database.insert(chronologieEntryTable).values(data.entries);
        }
      };

      if (trx) {
        await performCreate(trx);
      } else {
        await db.transaction(async (tx) => {
          await performCreate(tx);
        });
      }

      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create chronologie: ${error}`);
    }
  }

  async update(
    entity: Chronologie,
    trx?: Transaction,
  ): Promise<Result<Chronologie>> {
    try {
      const data = chronologieToPersistence(entity);
      const chronologieId = entity.id.value.toString();

      const performUpdate = async (database: DbClient | Transaction) => {
        await database
          .update(chronologieTable)
          .set({
            title: data.chronologie.title,
            updatedAt: data.chronologie.updatedAt ?? new Date(),
          })
          .where(eq(chronologieTable.id, chronologieId));

        await database
          .delete(chronologieEntryTable)
          .where(eq(chronologieEntryTable.chronologieId, chronologieId));

        if (data.entries.length > 0) {
          await database.insert(chronologieEntryTable).values(data.entries);
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
      return Result.fail(`Failed to update chronologie: ${error}`);
    }
  }

  async delete(
    id: ChronologieId,
    trx?: Transaction,
  ): Promise<Result<ChronologieId>> {
    try {
      await this.getDb(trx)
        .delete(chronologieTable)
        .where(eq(chronologieTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete chronologie: ${error}`);
    }
  }

  async findById(id: ChronologieId): Promise<Result<Option<Chronologie>>> {
    try {
      const chronologieId = String(id.value);

      const chronologieRecords = await db
        .select()
        .from(chronologieTable)
        .where(eq(chronologieTable.id, chronologieId))
        .limit(1);

      const chronologieRecord = chronologieRecords[0];
      if (!chronologieRecord) {
        return Result.ok(Option.none());
      }

      const entryRecords = await db
        .select()
        .from(chronologieEntryTable)
        .where(eq(chronologieEntryTable.chronologieId, chronologieId))
        .orderBy(asc(chronologieEntryTable.position));

      const chronologieResult = chronologieToDomain(
        chronologieRecord,
        entryRecords,
      );
      if (chronologieResult.isFailure) {
        return Result.fail(chronologieResult.getError());
      }

      return Result.ok(Option.some(chronologieResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find chronologie by id: ${error}`);
    }
  }

  async findByUserId(
    userId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Chronologie>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const chronologieRecords = await db
        .select()
        .from(chronologieTable)
        .where(eq(chronologieTable.userId, userId))
        .orderBy(asc(chronologieTable.createdAt))
        .limit(pagination.limit)
        .offset(offset);

      const [countRow] = await db
        .select({ value: sqlCount() })
        .from(chronologieTable)
        .where(eq(chronologieTable.userId, userId));

      if (chronologieRecords.length === 0) {
        return Result.ok(
          createPaginatedResult([], pagination, countRow?.value ?? 0),
        );
      }

      const hydrateResult = await this.hydrateChronologies(chronologieRecords);
      if (hydrateResult.isFailure) {
        return Result.fail(hydrateResult.getError());
      }

      return Result.ok(
        createPaginatedResult(
          hydrateResult.getValue(),
          pagination,
          countRow?.value ?? 0,
        ),
      );
    } catch (error) {
      return Result.fail(`Failed to find chronologies for user: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Chronologie>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [chronologieRecords, countResult] = await Promise.all([
        db
          .select()
          .from(chronologieTable)
          .orderBy(asc(chronologieTable.createdAt))
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      if (chronologieRecords.length === 0) {
        return Result.ok(
          createPaginatedResult([], pagination, countResult.getValue()),
        );
      }

      const hydrateResult = await this.hydrateChronologies(chronologieRecords);
      if (hydrateResult.isFailure) {
        return Result.fail(hydrateResult.getError());
      }

      return Result.ok(
        createPaginatedResult(
          hydrateResult.getValue(),
          pagination,
          countResult.getValue(),
        ),
      );
    } catch (error) {
      return Result.fail(`Failed to find all chronologies: ${error}`);
    }
  }

  async findMany(
    props: Partial<Chronologie["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Chronologie>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return this.findAll(pagination);
      }
      return this.findByUserId(userId, pagination);
    } catch (error) {
      return Result.fail(`Failed to find chronologies: ${error}`);
    }
  }

  async findBy(
    props: Partial<Chronologie["_props"]>,
  ): Promise<Result<Option<Chronologie>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return Result.ok(Option.none());
      }

      const chronologieRecords = await db
        .select()
        .from(chronologieTable)
        .where(eq(chronologieTable.userId, userId))
        .limit(1);

      const chronologieRecord = chronologieRecords[0];
      if (!chronologieRecord) {
        return Result.ok(Option.none());
      }

      const entryRecords = await db
        .select()
        .from(chronologieEntryTable)
        .where(eq(chronologieEntryTable.chronologieId, chronologieRecord.id))
        .orderBy(asc(chronologieEntryTable.position));

      const chronologieResult = chronologieToDomain(
        chronologieRecord,
        entryRecords,
      );
      if (chronologieResult.isFailure) {
        return Result.fail(chronologieResult.getError());
      }

      return Result.ok(Option.some(chronologieResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find chronologie: ${error}`);
    }
  }

  async exists(id: ChronologieId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: chronologieTable.id })
        .from(chronologieTable)
        .where(eq(chronologieTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check chronologie existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const [result] = await db
        .select({ value: sqlCount() })
        .from(chronologieTable);
      return Result.ok(result?.value ?? 0);
    } catch (error) {
      return Result.fail(`Failed to count chronologies: ${error}`);
    }
  }
}
