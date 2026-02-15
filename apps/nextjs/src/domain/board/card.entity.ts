import { Entity, Option, Result, UUID } from "@packages/ddd-kit";
import { CardId } from "./card-id";
import type { CardProgress } from "./value-objects/card-progress.vo";
import type { CardTitle } from "./value-objects/card-title.vo";

export interface ICardProps {
  title: CardTitle;
  description: Option<string>;
  content: Option<string>;
  isCompleted: boolean;
  position: number;
  progress: number;
  priority: Option<string>;
  tags: string[];
  link: Option<string>;
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

  updateDescription(description: string | undefined): void {
    this._props.description = Option.fromNullable(description ?? null);
    this._props.updatedAt = Option.some(new Date());
  }

  updateContent(content: string | undefined): void {
    this._props.content = Option.fromNullable(content ?? null);
    this._props.updatedAt = Option.some(new Date());
  }

  updateProgress(progress: CardProgress): Result<void> {
    this._props.progress = progress.value;
    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  updateDueDate(dueDate: string | undefined): void {
    this._props.dueDate = Option.fromNullable(dueDate ?? null);
    this._props.updatedAt = Option.some(new Date());
  }

  updatePriority(priority: string | undefined): void {
    this._props.priority = Option.fromNullable(priority ?? null);
    this._props.updatedAt = Option.some(new Date());
  }

  updateTags(tags: string[]): void {
    this._props.tags = tags;
    this._props.updatedAt = Option.some(new Date());
  }

  updateLink(link: string | undefined): void {
    this._props.link = Option.fromNullable(link ?? null);
    this._props.updatedAt = Option.some(new Date());
  }

  updatePosition(position: number): void {
    this._props.position = position;
  }

  static create(
    props: {
      title: CardTitle;
      description?: string;
      content?: string;
      position: number;
      progress?: number;
      priority?: string;
      tags?: string[];
      link?: string;
      dueDate?: string;
    },
    id?: UUID<string | number>,
  ): Card {
    return new Card(
      {
        title: props.title,
        description: Option.fromNullable(props.description ?? null),
        content: Option.fromNullable(props.content ?? null),
        isCompleted: false,
        position: props.position,
        progress: props.progress ?? 0,
        priority: Option.fromNullable(props.priority ?? null),
        tags: props.tags ?? [],
        link: Option.fromNullable(props.link ?? null),
        dueDate: Option.fromNullable(props.dueDate ?? null),
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
