import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { EmotionEntryId } from "./emotion-entry-id";
import { EmotionRecordedEvent } from "./events/emotion-recorded.event";
import type { EmotionCategory } from "./value-objects/emotion-category.vo";

export interface IEmotionEntryProps {
  userId: string;
  category: EmotionCategory;
  emotionDate: string;
  createdAt: Date;
  updatedAt: Option<Date>;
}

export interface ICreateEmotionEntryProps {
  userId: string;
  category: EmotionCategory;
  emotionDate?: string;
}

export class EmotionEntry extends Aggregate<IEmotionEntryProps> {
  private constructor(props: IEmotionEntryProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): EmotionEntryId {
    return EmotionEntryId.create(this._id);
  }

  static create(
    props: ICreateEmotionEntryProps,
    id?: UUID<string | number>,
  ): Result<EmotionEntry> {
    const newId = id ?? new UUID<string>();
    const now = new Date();
    const dateStr =
      props.emotionDate ??
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const entry = new EmotionEntry(
      {
        userId: props.userId,
        category: props.category,
        emotionDate: dateStr,
        createdAt: now,
        updatedAt: Option.none(),
      },
      newId,
    );

    entry.addEvent(
      new EmotionRecordedEvent(
        newId.value.toString(),
        props.userId,
        props.category.value,
      ),
    );

    return Result.ok(entry);
  }

  update(category: EmotionCategory): void {
    this._props.category = category;
    this._props.updatedAt = Option.some(new Date());

    this.addEvent(
      new EmotionRecordedEvent(
        this.id.value.toString(),
        this._props.userId,
        category.value,
      ),
    );
  }

  static reconstitute(
    props: IEmotionEntryProps,
    id: EmotionEntryId,
  ): EmotionEntry {
    return new EmotionEntry(props, id);
  }
}
