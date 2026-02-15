import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { BoardId } from "./board-id";
import type { Card } from "./card.entity";
import { Column } from "./column.entity";
import { BoardCreatedEvent } from "./events/board-created.event";
import { CardCompletedEvent } from "./events/card-completed.event";
import type { BoardTitle } from "./value-objects/board-title.vo";
import type { BoardType } from "./value-objects/board-type.vo";
import type { CardProgress } from "./value-objects/card-progress.vo";

export interface IBoardProps {
  userId: string;
  title: BoardTitle;
  type: BoardType;
  description: Option<string>;
  priority: Option<string>;
  dueDate: Option<string>;
  tags: string[];
  link: Option<string>;
  columns: Column[];
  createdAt: Date;
  updatedAt: Option<Date>;
}

export interface ICreateBoardProps {
  userId: string;
  title: BoardTitle;
  type: BoardType;
  columns: Column[];
  description?: string;
  priority?: string;
  dueDate?: string;
  tags?: string[];
  link?: string;
}

export class Board extends Aggregate<IBoardProps> {
  private constructor(props: IBoardProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): BoardId {
    return BoardId.create(this._id);
  }

  static create(
    props: ICreateBoardProps,
    id?: UUID<string | number>,
  ): Result<Board> {
    const newId = id ?? new UUID<string>();
    const now = new Date();

    const board = new Board(
      {
        userId: props.userId,
        title: props.title,
        type: props.type,
        description: Option.fromNullable(props.description ?? null),
        priority: Option.fromNullable(props.priority ?? null),
        dueDate: Option.fromNullable(props.dueDate ?? null),
        tags: props.tags ?? [],
        link: Option.fromNullable(props.link ?? null),
        columns: props.columns,
        createdAt: now,
        updatedAt: Option.none(),
      },
      newId,
    );

    board.addEvent(
      new BoardCreatedEvent(
        newId.value.toString(),
        props.userId,
        props.type.value,
      ),
    );

    return Result.ok(board);
  }

  updateTitle(title: BoardTitle): void {
    this._props.title = title;
    this._props.updatedAt = Option.some(new Date());
  }

  findCard(cardId: string): Option<Card> {
    for (const column of this._props.columns) {
      const cardOption = column.findCard(cardId);
      if (cardOption.isSome()) return cardOption;
    }
    return Option.none();
  }

  toggleCard(cardId: string): Result<void> {
    const cardOption = this.findCard(cardId);
    if (cardOption.isNone()) {
      return Result.fail("Card not found");
    }
    cardOption.unwrap().toggleCompleted();
    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  addCardToColumn(columnId: string, card: Card): Result<void> {
    const column = this._props.columns.find(
      (c) => c.id.value.toString() === columnId,
    );
    if (!column) {
      return Result.fail("Column not found");
    }
    column.addCard(card);
    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  removeCard(cardId: string): Result<void> {
    for (const column of this._props.columns) {
      const removeResult = column.removeCard(cardId);
      if (removeResult.isSuccess) {
        this._props.updatedAt = Option.some(new Date());
        return Result.ok();
      }
    }
    return Result.fail("Card not found");
  }

  moveCard(
    cardId: string,
    toColumnId: string,
    newPosition: number,
  ): Result<void> {
    let movedCard: Card | undefined;
    let sourceColumn: Column | undefined;

    for (const column of this._props.columns) {
      const cardOption = column.findCard(cardId);
      if (cardOption.isSome()) {
        movedCard = cardOption.unwrap();
        sourceColumn = column;
        break;
      }
    }

    if (!movedCard || !sourceColumn) {
      return Result.fail("Card not found");
    }

    const targetColumn = this._props.columns.find(
      (c) => c.id.value.toString() === toColumnId,
    );
    if (!targetColumn) {
      return Result.fail("Target column not found");
    }

    const removeResult = sourceColumn.removeCard(cardId);
    if (removeResult.isFailure) {
      return Result.fail(removeResult.getError());
    }
    sourceColumn.recalculatePositions();

    targetColumn.insertCardAtPosition(movedCard, newPosition);

    this._props.updatedAt = Option.some(new Date());

    const isDoneColumn = targetColumn.get("title").toLowerCase() === "done";
    if (isDoneColumn) {
      this.addEvent(
        new CardCompletedEvent(
          this.id.value.toString(),
          cardId,
          this._props.userId,
        ),
      );
    }

    return Result.ok();
  }

  reorderCard(
    columnId: string,
    cardId: string,
    newPosition: number,
  ): Result<void> {
    const column = this._props.columns.find(
      (c) => c.id.value.toString() === columnId,
    );
    if (!column) {
      return Result.fail("Column not found");
    }

    const cardOption = column.findCard(cardId);
    if (cardOption.isNone()) {
      return Result.fail("Card not found in column");
    }

    const removeResult = column.removeCard(cardId);
    if (removeResult.isFailure) {
      return Result.fail(removeResult.getError());
    }

    column.insertCardAtPosition(cardOption.unwrap(), newPosition);
    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  addColumn(title: string, position?: number): Result<void> {
    const pos = position ?? this._props.columns.length;
    const column = Column.create({ title, position: pos });
    this._props.columns.push(column);
    this._props.columns.sort((a, b) => a.get("position") - b.get("position"));
    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  updateColumnTitle(columnId: string, title: string): Result<void> {
    const column = this._props.columns.find(
      (c) => c.id.value.toString() === columnId,
    );
    if (!column) {
      return Result.fail("Column not found");
    }
    column.updateTitle(title);
    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  updateColumnColor(columnId: string, color: number | undefined): Result<void> {
    const column = this._props.columns.find(
      (c) => c.id.value.toString() === columnId,
    );
    if (!column) {
      return Result.fail("Column not found");
    }
    column.updateColor(color);
    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  removeColumn(columnId: string): Result<void> {
    const column = this._props.columns.find(
      (c) => c.id.value.toString() === columnId,
    );
    if (!column) {
      return Result.fail("Column not found");
    }
    if (column.get("cards").length > 0) {
      return Result.fail("Cannot remove column with cards");
    }
    this._props.columns = this._props.columns.filter(
      (c) => c.id.value.toString() !== columnId,
    );
    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  updateCard(
    cardId: string,
    updates: {
      title?: import("./value-objects/card-title.vo").CardTitle;
      description?: string | undefined;
      content?: string | undefined;
      progress?: CardProgress;
      priority?: string | undefined;
      tags?: string[];
      link?: string | undefined;
      dueDate?: string | undefined;
    },
  ): Result<void> {
    const cardOption = this.findCard(cardId);
    if (cardOption.isNone()) {
      return Result.fail("Card not found");
    }

    const card = cardOption.unwrap();
    const wasBelowComplete = card.get("progress") < 100;

    if (updates.title !== undefined) {
      card.updateTitle(updates.title);
    }
    if ("description" in updates) {
      card.updateDescription(updates.description);
    }
    if ("content" in updates) {
      card.updateContent(updates.content);
    }
    if (updates.progress !== undefined) {
      card.updateProgress(updates.progress);
    }
    if ("priority" in updates) {
      card.updatePriority(updates.priority);
    }
    if (updates.tags !== undefined) {
      card.updateTags(updates.tags);
    }
    if ("link" in updates) {
      card.updateLink(updates.link);
    }
    if ("dueDate" in updates) {
      card.updateDueDate(updates.dueDate);
    }

    if (
      updates.progress !== undefined &&
      wasBelowComplete &&
      updates.progress.value === 100
    ) {
      this.addEvent(
        new CardCompletedEvent(
          this.id.value.toString(),
          cardId,
          this._props.userId,
        ),
      );
    }

    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  static reconstitute(props: IBoardProps, id: BoardId): Board {
    return new Board(props, id);
  }
}
