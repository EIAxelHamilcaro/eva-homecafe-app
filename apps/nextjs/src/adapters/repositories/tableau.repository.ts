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
  tableauRow as tableauRowTable,
  tableau as tableauTable,
} from "@packages/drizzle/schema";
import {
  tableauToDomain,
  tableauToPersistence,
} from "@/adapters/mappers/tableau.mapper";
import type { ITableauRepository } from "@/application/ports/tableau-repository.port";
import type { Tableau } from "@/domain/tableau/tableau.aggregate";
import type { TableauId } from "@/domain/tableau/tableau-id";

type TableauRecord = typeof tableauTable.$inferSelect;
type RowRecord = typeof tableauRowTable.$inferSelect;

export class DrizzleTableauRepository implements ITableauRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  private async hydrateTableaux(
    tableauRecords: TableauRecord[],
  ): Promise<Result<Tableau[]>> {
    const tableauIds = tableauRecords.map((t) => t.id);

    const rowRecords: RowRecord[] =
      tableauIds.length > 0
        ? await db
            .select()
            .from(tableauRowTable)
            .where(inArray(tableauRowTable.tableauId, tableauIds))
            .orderBy(asc(tableauRowTable.position))
        : [];

    const rowsByTableauId = new Map<string, RowRecord[]>();
    for (const row of rowRecords) {
      const existing = rowsByTableauId.get(row.tableauId) ?? [];
      existing.push(row);
      rowsByTableauId.set(row.tableauId, existing);
    }

    const tableaux: Tableau[] = [];
    for (const tableauRecord of tableauRecords) {
      const rows = rowsByTableauId.get(tableauRecord.id) ?? [];
      const tableauResult = tableauToDomain(tableauRecord, rows);
      if (tableauResult.isFailure) {
        return Result.fail(tableauResult.getError());
      }
      tableaux.push(tableauResult.getValue());
    }

    return Result.ok(tableaux);
  }

  async create(entity: Tableau, trx?: Transaction): Promise<Result<Tableau>> {
    try {
      const data = tableauToPersistence(entity);

      const performCreate = async (database: DbClient | Transaction) => {
        await database.insert(tableauTable).values(data.tableau);
        if (data.rows.length > 0) {
          await database.insert(tableauRowTable).values(data.rows);
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
      return Result.fail(`Failed to create tableau: ${error}`);
    }
  }

  async update(entity: Tableau, trx?: Transaction): Promise<Result<Tableau>> {
    try {
      const data = tableauToPersistence(entity);
      const tableauId = entity.id.value.toString();

      const performUpdate = async (database: DbClient | Transaction) => {
        await database
          .update(tableauTable)
          .set({
            title: data.tableau.title,
            statusOptions: data.tableau.statusOptions,
            priorityOptions: data.tableau.priorityOptions,
            columns: data.tableau.columns,
            updatedAt: data.tableau.updatedAt ?? new Date(),
          })
          .where(eq(tableauTable.id, tableauId));

        await database
          .delete(tableauRowTable)
          .where(eq(tableauRowTable.tableauId, tableauId));

        if (data.rows.length > 0) {
          await database.insert(tableauRowTable).values(data.rows);
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
      return Result.fail(`Failed to update tableau: ${error}`);
    }
  }

  async delete(id: TableauId, trx?: Transaction): Promise<Result<TableauId>> {
    try {
      await this.getDb(trx)
        .delete(tableauTable)
        .where(eq(tableauTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete tableau: ${error}`);
    }
  }

  async findById(id: TableauId): Promise<Result<Option<Tableau>>> {
    try {
      const tableauId = String(id.value);

      const tableauRecords = await db
        .select()
        .from(tableauTable)
        .where(eq(tableauTable.id, tableauId))
        .limit(1);

      const tableauRecord = tableauRecords[0];
      if (!tableauRecord) {
        return Result.ok(Option.none());
      }

      const rowRecords = await db
        .select()
        .from(tableauRowTable)
        .where(eq(tableauRowTable.tableauId, tableauId))
        .orderBy(asc(tableauRowTable.position));

      const tableauResult = tableauToDomain(tableauRecord, rowRecords);
      if (tableauResult.isFailure) {
        return Result.fail(tableauResult.getError());
      }

      return Result.ok(Option.some(tableauResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find tableau by id: ${error}`);
    }
  }

  async findByUserId(
    userId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Tableau>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const tableauRecords = await db
        .select()
        .from(tableauTable)
        .where(eq(tableauTable.userId, userId))
        .orderBy(asc(tableauTable.createdAt))
        .limit(pagination.limit)
        .offset(offset);

      const [countRow] = await db
        .select({ value: sqlCount() })
        .from(tableauTable)
        .where(eq(tableauTable.userId, userId));

      if (tableauRecords.length === 0) {
        return Result.ok(
          createPaginatedResult([], pagination, countRow?.value ?? 0),
        );
      }

      const hydrateResult = await this.hydrateTableaux(tableauRecords);
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
      return Result.fail(`Failed to find tableaux for user: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Tableau>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [tableauRecords, countResult] = await Promise.all([
        db
          .select()
          .from(tableauTable)
          .orderBy(asc(tableauTable.createdAt))
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      if (tableauRecords.length === 0) {
        return Result.ok(
          createPaginatedResult([], pagination, countResult.getValue()),
        );
      }

      const hydrateResult = await this.hydrateTableaux(tableauRecords);
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
      return Result.fail(`Failed to find all tableaux: ${error}`);
    }
  }

  async findMany(
    props: Partial<Tableau["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Tableau>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return this.findAll(pagination);
      }
      return this.findByUserId(userId, pagination);
    } catch (error) {
      return Result.fail(`Failed to find tableaux: ${error}`);
    }
  }

  async findBy(
    props: Partial<Tableau["_props"]>,
  ): Promise<Result<Option<Tableau>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return Result.ok(Option.none());
      }

      const tableauRecords = await db
        .select()
        .from(tableauTable)
        .where(eq(tableauTable.userId, userId))
        .limit(1);

      const tableauRecord = tableauRecords[0];
      if (!tableauRecord) {
        return Result.ok(Option.none());
      }

      const rowRecords = await db
        .select()
        .from(tableauRowTable)
        .where(eq(tableauRowTable.tableauId, tableauRecord.id))
        .orderBy(asc(tableauRowTable.position));

      const tableauResult = tableauToDomain(tableauRecord, rowRecords);
      if (tableauResult.isFailure) {
        return Result.fail(tableauResult.getError());
      }

      return Result.ok(Option.some(tableauResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find tableau: ${error}`);
    }
  }

  async exists(id: TableauId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: tableauTable.id })
        .from(tableauTable)
        .where(eq(tableauTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check tableau existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const [result] = await db
        .select({ value: sqlCount() })
        .from(tableauTable);
      return Result.ok(result?.value ?? 0);
    } catch (error) {
      return Result.fail(`Failed to count tableaux: ${error}`);
    }
  }
}
