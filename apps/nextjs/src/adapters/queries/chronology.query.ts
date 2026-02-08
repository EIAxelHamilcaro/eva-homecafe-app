import { board, boardColumn, card, db } from "@packages/drizzle";
import { and, asc, eq, isNotNull, sql } from "drizzle-orm";
import type {
  IChronologyCardDto,
  IGetChronologyOutputDto,
} from "@/application/dto/board/get-chronology.dto";

function getMonthRange(month?: string): { start: string; end: string } {
  const now = new Date();
  const year = month ? Number(month.slice(0, 4)) : now.getFullYear();
  const mon = month ? Number(month.slice(5, 7)) : now.getMonth() + 1;
  const start = `${year}-${String(mon).padStart(2, "0")}-01`;
  const lastDay = new Date(year, mon, 0).getDate();
  const end = `${year}-${String(mon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export async function getChronology(
  userId: string,
  month?: string,
): Promise<IGetChronologyOutputDto> {
  const { start, end } = getMonthRange(month);

  const records = await db
    .select({
      id: card.id,
      title: card.title,
      description: card.description,
      dueDate: card.dueDate,
      isCompleted: card.isCompleted,
      progress: card.progress,
      boardId: board.id,
      boardTitle: board.title,
      boardType: board.type,
      columnTitle: boardColumn.title,
    })
    .from(card)
    .innerJoin(boardColumn, eq(card.columnId, boardColumn.id))
    .innerJoin(board, eq(boardColumn.boardId, board.id))
    .where(
      and(
        eq(board.userId, userId),
        isNotNull(card.dueDate),
        sql`${card.dueDate} >= ${start}`,
        sql`${card.dueDate} <= ${end}`,
      ),
    )
    .orderBy(asc(card.dueDate));

  const cards: IChronologyCardDto[] = records.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    dueDate: r.dueDate as string,
    isCompleted: r.isCompleted,
    progress: r.progress ?? 0,
    boardId: r.boardId,
    boardTitle: r.boardTitle,
    boardType: r.boardType,
    columnTitle: r.columnTitle,
  }));

  const eventDates: IGetChronologyOutputDto["eventDates"] = {};
  for (const c of cards) {
    const existing = eventDates[c.dueDate];
    if (existing) {
      existing.count++;
      if (!existing.boards.some((b) => b.id === c.boardId)) {
        existing.boards.push({ id: c.boardId, title: c.boardTitle });
      }
    } else {
      eventDates[c.dueDate] = {
        count: 1,
        boards: [{ id: c.boardId, title: c.boardTitle }],
      };
    }
  }

  return { cards, eventDates };
}
