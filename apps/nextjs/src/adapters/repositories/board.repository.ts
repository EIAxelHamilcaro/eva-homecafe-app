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
  asc,
  type DbClient,
  db,
  desc,
  eq,
  inArray,
  count as sqlCount,
  type Transaction,
} from "@packages/drizzle";
import {
  boardColumn as boardColumnTable,
  board as boardTable,
  card as cardTable,
} from "@packages/drizzle/schema";
import {
  boardToDomain,
  boardToPersistence,
} from "@/adapters/mappers/board.mapper";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import type { Board } from "@/domain/board/board.aggregate";
import type { BoardId } from "@/domain/board/board-id";

type BoardRecord = typeof boardTable.$inferSelect;
type ColumnRecord = typeof boardColumnTable.$inferSelect;
type CardRecord = typeof cardTable.$inferSelect;

export class DrizzleBoardRepository implements IBoardRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  private async hydrateBoards(
    boardRecords: BoardRecord[],
  ): Promise<Result<Board[]>> {
    const boardIds = boardRecords.map((b) => b.id);

    const columnRecords = await db
      .select()
      .from(boardColumnTable)
      .where(inArray(boardColumnTable.boardId, boardIds))
      .orderBy(asc(boardColumnTable.position));

    const columnIds = columnRecords.map((c) => c.id);
    const cardRecords: CardRecord[] =
      columnIds.length > 0
        ? await db
            .select()
            .from(cardTable)
            .where(inArray(cardTable.columnId, columnIds))
            .orderBy(asc(cardTable.position))
        : [];

    const columnsByBoardId = new Map<string, ColumnRecord[]>();
    for (const col of columnRecords) {
      const existing = columnsByBoardId.get(col.boardId) ?? [];
      existing.push(col);
      columnsByBoardId.set(col.boardId, existing);
    }

    const cardsByColumnId = new Map<string, CardRecord[]>();
    for (const card of cardRecords) {
      const existing = cardsByColumnId.get(card.columnId) ?? [];
      existing.push(card);
      cardsByColumnId.set(card.columnId, existing);
    }

    const boards: Board[] = [];
    for (const boardRecord of boardRecords) {
      const cols = columnsByBoardId.get(boardRecord.id) ?? [];
      const colIds = cols.map((c) => c.id);
      const cards = colIds.flatMap((cid) => cardsByColumnId.get(cid) ?? []);

      const boardResult = boardToDomain(boardRecord, cols, cards);
      if (boardResult.isFailure) {
        return Result.fail(boardResult.getError());
      }
      boards.push(boardResult.getValue());
    }

    return Result.ok(boards);
  }

  async create(entity: Board, trx?: Transaction): Promise<Result<Board>> {
    try {
      const data = boardToPersistence(entity);

      const performCreate = async (database: DbClient | Transaction) => {
        await database.insert(boardTable).values(data.board);

        if (data.columns.length > 0) {
          await database.insert(boardColumnTable).values(data.columns);
        }

        if (data.cards.length > 0) {
          await database.insert(cardTable).values(data.cards);
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
      return Result.fail(`Failed to create board: ${error}`);
    }
  }

  async update(entity: Board, trx?: Transaction): Promise<Result<Board>> {
    try {
      const data = boardToPersistence(entity);
      const boardId = entity.id.value.toString();

      const performUpdate = async (database: DbClient | Transaction) => {
        await database
          .update(boardTable)
          .set({
            title: data.board.title,
            type: data.board.type,
            updatedAt: data.board.updatedAt ?? new Date(),
          })
          .where(eq(boardTable.id, boardId));

        await database
          .delete(boardColumnTable)
          .where(eq(boardColumnTable.boardId, boardId));

        if (data.columns.length > 0) {
          await database.insert(boardColumnTable).values(data.columns);
        }

        if (data.cards.length > 0) {
          await database.insert(cardTable).values(data.cards);
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
      return Result.fail(`Failed to update board: ${error}`);
    }
  }

  async delete(id: BoardId, trx?: Transaction): Promise<Result<BoardId>> {
    try {
      await this.getDb(trx)
        .delete(boardTable)
        .where(eq(boardTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete board: ${error}`);
    }
  }

  async findById(id: BoardId): Promise<Result<Option<Board>>> {
    try {
      const boardId = String(id.value);

      const boardRecords = await db
        .select()
        .from(boardTable)
        .where(eq(boardTable.id, boardId))
        .limit(1);

      const boardRecord = boardRecords[0];
      if (!boardRecord) {
        return Result.ok(Option.none());
      }

      const columnRecords = await db
        .select()
        .from(boardColumnTable)
        .where(eq(boardColumnTable.boardId, boardId))
        .orderBy(asc(boardColumnTable.position));

      const columnIds = columnRecords.map((c) => c.id);
      const cardRecords =
        columnIds.length > 0
          ? await db
              .select()
              .from(cardTable)
              .where(inArray(cardTable.columnId, columnIds))
              .orderBy(asc(cardTable.position))
          : [];

      const boardResult = boardToDomain(
        boardRecord,
        columnRecords,
        cardRecords,
      );
      if (boardResult.isFailure) {
        return Result.fail(boardResult.getError());
      }

      return Result.ok(Option.some(boardResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find board by id: ${error}`);
    }
  }

  async findByUserId(
    userId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
    type?: string,
  ): Promise<Result<PaginatedResult<Board>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const whereClause = type
        ? and(
            eq(boardTable.userId, userId),
            eq(boardTable.type, type as "todo" | "kanban"),
          )
        : eq(boardTable.userId, userId);

      const boardRecords = await db
        .select()
        .from(boardTable)
        .where(whereClause)
        .orderBy(desc(boardTable.createdAt))
        .limit(pagination.limit)
        .offset(offset);

      const [countRow] = await db
        .select({ value: sqlCount() })
        .from(boardTable)
        .where(whereClause);

      if (boardRecords.length === 0) {
        return Result.ok(
          createPaginatedResult([], pagination, countRow?.value ?? 0),
        );
      }

      const hydrateResult = await this.hydrateBoards(boardRecords);
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
      return Result.fail(`Failed to find boards for user: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Board>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [boardRecords, countResult] = await Promise.all([
        db
          .select()
          .from(boardTable)
          .orderBy(desc(boardTable.createdAt))
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      if (boardRecords.length === 0) {
        return Result.ok(
          createPaginatedResult([], pagination, countResult.getValue()),
        );
      }

      const hydrateResult = await this.hydrateBoards(boardRecords);
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
      return Result.fail(`Failed to find all boards: ${error}`);
    }
  }

  async findMany(
    props: Partial<Board["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Board>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return this.findAll(pagination);
      }
      return this.findByUserId(userId, pagination);
    } catch (error) {
      return Result.fail(`Failed to find boards: ${error}`);
    }
  }

  async findBy(
    props: Partial<Board["_props"]>,
  ): Promise<Result<Option<Board>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return Result.ok(Option.none());
      }

      const boardRecords = await db
        .select()
        .from(boardTable)
        .where(eq(boardTable.userId, userId))
        .limit(1);

      const boardRecord = boardRecords[0];
      if (!boardRecord) {
        return Result.ok(Option.none());
      }

      const columnRecords = await db
        .select()
        .from(boardColumnTable)
        .where(eq(boardColumnTable.boardId, boardRecord.id))
        .orderBy(asc(boardColumnTable.position));

      const columnIds = columnRecords.map((c) => c.id);
      const cardRecords =
        columnIds.length > 0
          ? await db
              .select()
              .from(cardTable)
              .where(inArray(cardTable.columnId, columnIds))
              .orderBy(asc(cardTable.position))
          : [];

      const boardResult = boardToDomain(
        boardRecord,
        columnRecords,
        cardRecords,
      );
      if (boardResult.isFailure) {
        return Result.fail(boardResult.getError());
      }

      return Result.ok(Option.some(boardResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find board: ${error}`);
    }
  }

  async exists(id: BoardId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: boardTable.id })
        .from(boardTable)
        .where(eq(boardTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check board existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const [result] = await db.select({ value: sqlCount() }).from(boardTable);
      return Result.ok(result?.value ?? 0);
    } catch (error) {
      return Result.fail(`Failed to count boards: ${error}`);
    }
  }
}
