import { Entity, Option, UUID } from "@packages/ddd-kit";
import { CardId } from "./card-id";
import type { CardTitle } from "./value-objects/card-title.vo";

export interface ICardProps {
  title: CardTitle;
  description: Option<string>;
  isCompleted: boolean;
  position: number;
  progress: number;
  dueDate: Option<string>;
  createdAt: Date;
  updatedAt: Option<Date>;
}

export class Card extends Entity<ICardProps> {
  private constructor(props: ICardProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): CardId {
    return CardId.create(this._id);
  }

  toggleCompleted(): void {
    this._props.isCompleted = !this._props.isCompleted;
    this._props.updatedAt = Option.some(new Date());
  }

  updateTitle(title: CardTitle): void {
    this._props.title = title;
    this._props.updatedAt = Option.some(new Date());
  }

  static create(
    props: {
      title: CardTitle;
      description?: string;
      position: number;
    },
    id?: UUID<string | number>,
  ): Card {
    return new Card(
      {
        title: props.title,
        description: Option.fromNullable(props.description ?? null),
        isCompleted: false,
        position: props.position,
        progress: 0,
        dueDate: Option.none(),
        createdAt: new Date(),
        updatedAt: Option.none(),
      },
      id ?? new UUID(),
    );
  }

  static reconstitute(props: ICardProps, id: CardId): Card {
    return new Card(props, id);
  }
}
