import { db } from "@packages/drizzle";
import { board, boardColumn, card } from "@packages/drizzle/schema";
import { asc, eq, inArray } from "drizzle-orm";
import type { IBoardDto } from "@/application/dto/board/common-board.dto";

export async function getBoardById(boardId: string): Promise<IBoardDto | null> {
  const [boardRecord] = await db
    .select()
    .from(board)
    .where(eq(board.id, boardId))
    .limit(1);

  if (!boardRecord) return null;

  const columns = await db
    .select()
    .from(boardColumn)
    .where(eq(boardColumn.boardId, boardId))
    .orderBy(asc(boardColumn.position));

  const columnIds = columns.map((c) => c.id);
  const cards =
    columnIds.length > 0
      ? await db
          .select()
          .from(card)
          .where(inArray(card.columnId, columnIds))
          .orderBy(asc(card.position))
      : [];

  return {
    id: boardRecord.id,
    title: boardRecord.title,
    type: boardRecord.type as "todo" | "kanban",
    columns: columns.map((col) => ({
      id: col.id,
      title: col.title,
      position: col.position,
      cards: cards
        .filter((c) => c.columnId === col.id)
        .map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          isCompleted: c.isCompleted,
          position: c.position,
          progress: c.progress ?? 0,
          dueDate: c.dueDate,
        })),
    })),
    createdAt: boardRecord.createdAt.toISOString(),
    updatedAt: boardRecord.updatedAt?.toISOString() ?? null,
  };
}
