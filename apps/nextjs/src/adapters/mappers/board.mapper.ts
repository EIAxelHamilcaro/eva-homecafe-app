import { Option, Result, UUID } from "@packages/ddd-kit";
import type {
  boardColumn as boardColumnTable,
  board as boardTable,
  card as cardTable,
} from "@packages/drizzle/schema";
import { Board } from "@/domain/board/board.aggregate";
import { BoardId } from "@/domain/board/board-id";
import { Card } from "@/domain/board/card.entity";
import { CardId } from "@/domain/board/card-id";
import { Column } from "@/domain/board/column.entity";
import { ColumnId } from "@/domain/board/column-id";
import { BoardTitle } from "@/domain/board/value-objects/board-title.vo";
import { BoardType } from "@/domain/board/value-objects/board-type.vo";
import { CardTitle } from "@/domain/board/value-objects/card-title.vo";

type BoardRecord = typeof boardTable.$inferSelect;
type ColumnRecord = typeof boardColumnTable.$inferSelect;
type CardRecord = typeof cardTable.$inferSelect;

export function boardToDomain(
  boardRecord: BoardRecord,
  columnRecords: ColumnRecord[],
  cardRecords: CardRecord[],
): Result<Board> {
  const titleResult = BoardTitle.create(boardRecord.title);
  if (titleResult.isFailure) {
    return Result.fail(titleResult.getError());
  }

  const typeResult = BoardType.create(boardRecord.type as string);
  if (typeResult.isFailure) {
    return Result.fail(typeResult.getError());
  }

  const cardsByColumnId = new Map<string, CardRecord[]>();
  for (const cr of cardRecords) {
    const existing = cardsByColumnId.get(cr.columnId) ?? [];
    existing.push(cr);
    cardsByColumnId.set(cr.columnId, existing);
  }

  const columns: Column[] = [];
  for (const colRecord of columnRecords) {
    const colCards = cardsByColumnId.get(colRecord.id) ?? [];
    const domainCards: Card[] = [];

    for (const cr of colCards) {
      const cardTitleResult = CardTitle.create(cr.title);
      if (cardTitleResult.isFailure) {
        return Result.fail(cardTitleResult.getError());
      }

      domainCards.push(
        Card.reconstitute(
          {
            title: cardTitleResult.getValue(),
            description: Option.fromNullable(cr.description),
            content: Option.fromNullable(cr.content),
            isCompleted: cr.isCompleted,
            position: cr.position,
            progress: cr.progress ?? 0,
            priority: Option.fromNullable(cr.priority),
            tags: (cr.tags as string[]) ?? [],
            link: Option.fromNullable(cr.link),
            dueDate: Option.fromNullable(cr.dueDate),
            createdAt: cr.createdAt,
            updatedAt: Option.fromNullable(cr.updatedAt),
          },
          CardId.create(new UUID(cr.id)),
        ),
      );
    }

    columns.push(
      Column.reconstitute(
        {
          title: colRecord.title,
          position: colRecord.position,
          cards: domainCards,
          createdAt: colRecord.createdAt,
        },
        ColumnId.create(new UUID(colRecord.id)),
      ),
    );
  }

  const board = Board.reconstitute(
    {
      userId: boardRecord.userId,
      title: titleResult.getValue(),
      type: typeResult.getValue(),
      description: Option.fromNullable(boardRecord.description),
      priority: Option.fromNullable(boardRecord.priority),
      dueDate: Option.fromNullable(boardRecord.dueDate),
      tags: (boardRecord.tags as string[]) ?? [],
      link: Option.fromNullable(boardRecord.link),
      columns,
      createdAt: boardRecord.createdAt,
      updatedAt: Option.fromNullable(boardRecord.updatedAt),
    },
    BoardId.create(new UUID(boardRecord.id)),
  );

  return Result.ok(board);
}

export function boardToPersistence(board: Board) {
  const updatedAt = board.get("updatedAt");
  const description = board.get("description");
  const priority = board.get("priority");
  const dueDate = board.get("dueDate");
  const link = board.get("link");
  return {
    board: {
      id: board.id.value.toString(),
      userId: board.get("userId"),
      title: board.get("title").value,
      type: board.get("type").value as "todo" | "kanban",
      description: description.isSome() ? description.unwrap() : null,
      priority: priority.isSome() ? priority.unwrap() : null,
      dueDate: dueDate.isSome() ? dueDate.unwrap() : null,
      tags: board.get("tags"),
      link: link.isSome() ? link.unwrap() : null,
      createdAt: board.get("createdAt"),
      updatedAt: updatedAt.isSome() ? updatedAt.unwrap() : null,
    },
    columns: board.get("columns").map((col) => ({
      id: col.id.value.toString(),
      boardId: board.id.value.toString(),
      title: col.get("title"),
      position: col.get("position"),
      createdAt: col.get("createdAt"),
    })),
    cards: board.get("columns").flatMap((col) =>
      col.get("cards").map((c) => {
        const cardUpdatedAt = c.get("updatedAt");
        const cardDescription = c.get("description");
        const cardContent = c.get("content");
        const cardPriority = c.get("priority");
        const cardLink = c.get("link");
        const cardDueDate = c.get("dueDate");
        return {
          id: c.id.value.toString(),
          columnId: col.id.value.toString(),
          title: c.get("title").value,
          description: cardDescription.isSome()
            ? cardDescription.unwrap()
            : null,
          content: cardContent.isSome() ? cardContent.unwrap() : null,
          isCompleted: c.get("isCompleted"),
          position: c.get("position"),
          progress: c.get("progress"),
          priority: cardPriority.isSome() ? cardPriority.unwrap() : null,
          tags: c.get("tags"),
          link: cardLink.isSome() ? cardLink.unwrap() : null,
          dueDate: cardDueDate.isSome() ? cardDueDate.unwrap() : null,
          createdAt: c.get("createdAt"),
          updatedAt: cardUpdatedAt.isSome() ? cardUpdatedAt.unwrap() : null,
        };
      }),
    ),
  };
}
