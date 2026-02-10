import { board, boardColumn, card, db } from "@packages/drizzle";
import { and, count, desc, eq } from "drizzle-orm";

export interface IPendingTaskDto {
  id: string;
  title: string;
  dueDate: string | null;
  boardTitle: string;
  boardType: "todo" | "kanban";
}

export async function getPendingTasks(
  userId: string,
  limit = 5,
): Promise<IPendingTaskDto[]> {
  const records = await db
    .select({
      id: card.id,
      title: card.title,
      dueDate: card.dueDate,
      boardTitle: board.title,
      boardType: board.type,
    })
    .from(card)
    .innerJoin(boardColumn, eq(card.columnId, boardColumn.id))
    .innerJoin(board, eq(boardColumn.boardId, board.id))
    .where(and(eq(board.userId, userId), eq(card.isCompleted, false)))
    .orderBy(desc(card.createdAt))
    .limit(limit);

  return records.map((r) => ({
    id: r.id,
    title: r.title,
    dueDate: r.dueDate,
    boardTitle: r.boardTitle,
    boardType: r.boardType,
  }));
}

export async function getTotalCardCount(userId: string): Promise<number> {
  const result = await db
    .select({ value: count() })
    .from(card)
    .innerJoin(boardColumn, eq(card.columnId, boardColumn.id))
    .innerJoin(board, eq(boardColumn.boardId, board.id))
    .where(eq(board.userId, userId));

  return result[0]?.value ?? 0;
}
