import { board, boardColumn, card, db } from "@packages/drizzle";
import { and, asc, eq, gte, isNotNull, lte } from "drizzle-orm";
import type {
  IChronologyCardDto,
  IGetChronologyOutputDto,
} from "@/application/dto/board/get-chronology.dto";

function getMonthRange(
  month?: string,
  monthSpan = 1,
): { start: string; end: string } {
  const now = new Date();
  const year = month ? Number(month.slice(0, 4)) : now.getFullYear();
  const mon = month ? Number(month.slice(5, 7)) : now.getMonth() + 1;
  const start = `${year}-${String(mon).padStart(2, "0")}-01`;
  const endDate = new Date(year, mon - 1 + monthSpan, 0);
  const endYear = endDate.getFullYear();
  const endMon = endDate.getMonth() + 1;
  const lastDay = endDate.getDate();
  const end = `${endYear}-${String(endMon).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export async function getChronology(
  userId: string,
  month?: string,
  months?: number,
): Promise<IGetChronologyOutputDto> {
  const { start, end } = getMonthRange(month, months ?? 1);

  const records = await db
    .select({
      id: card.id,
      title: card.title,
      description: card.description,
      dueDate: card.dueDate,
      createdAt: card.createdAt,
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
        gte(card.dueDate, start),
        lte(card.dueDate, end),
      ),
    )
    .orderBy(asc(card.dueDate));

  const cards: IChronologyCardDto[] = records.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    dueDate: r.dueDate as string,
    createdAt: r.createdAt.toISOString().slice(0, 10),
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
