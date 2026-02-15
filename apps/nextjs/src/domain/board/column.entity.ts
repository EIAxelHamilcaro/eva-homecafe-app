import { Entity, Option, Result, UUID } from "@packages/ddd-kit";
import type { Card } from "./card.entity";
import { ColumnId } from "./column-id";

export interface IColumnProps {
  title: string;
  position: number;
  color: Option<number>;
  cards: Card[];
  createdAt: Date;
}

export class Column extends Entity<IColumnProps> {
  private constructor(props: IColumnProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): ColumnId {
    return ColumnId.create(this._id);
  }

  updateTitle(title: string): void {
    this._props.title = title;
  }

  updateColor(color: number | undefined): void {
    this._props.color = Option.fromNullable(color ?? null);
  }

  addCard(card: Card): void {
    this._props.cards.push(card);
  }

  removeCard(cardId: string): Result<void> {
    const index = this._props.cards.findIndex(
      (c) => c.id.value.toString() === cardId,
    );
    if (index === -1) return Result.fail("Card not found");
    this._props.cards.splice(index, 1);
    return Result.ok();
  }

  findCard(cardId: string): Option<Card> {
    const card = this._props.cards.find(
      (c) => c.id.value.toString() === cardId,
    );
    return Option.fromNullable(card ?? null);
  }

  insertCardAtPosition(card: Card, position: number): void {
    card.updatePosition(position);
    this._props.cards.push(card);
    this._props.cards.sort((a, b) => a.get("position") - b.get("position"));
    this.recalculatePositions();
  }

  recalculatePositions(): void {
    this._props.cards.forEach((card, index) => {
      card.updatePosition(index);
    });
  }

  static create(
    props: {
      title: string;
      position: number;
      color?: number;
      cards?: Card[];
    },
    id?: UUID<string | number>,
  ): Column {
    return new Column(
      {
        title: props.title,
        position: props.position,
        color: Option.fromNullable(props.color ?? null),
        cards: props.cards ?? [],
        createdAt: new Date(),
      },
      id ?? new UUID(),
    );
  }

  static reconstitute(props: IColumnProps, id: ColumnId): Column {
    return new Column(props, id);
  }
}
