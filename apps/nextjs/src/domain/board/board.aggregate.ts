import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { BoardId } from "./board-id";
import type { Card } from "./card.entity";
import type { Column } from "./column.entity";
import { BoardCreatedEvent } from "./events/board-created.event";
import type { BoardTitle } from "./value-objects/board-title.vo";
import type { BoardType } from "./value-objects/board-type.vo";

export interface IBoardProps {
  userId: string;
  title: BoardTitle;
  type: BoardType;
  columns: Column[];
  createdAt: Date;
  updatedAt: Option<Date>;
}

export interface ICreateBoardProps {
  userId: string;
  title: BoardTitle;
  type: BoardType;
  columns: Column[];
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

  static reconstitute(props: IBoardProps, id: BoardId): Board {
    return new Board(props, id);
  }
}
