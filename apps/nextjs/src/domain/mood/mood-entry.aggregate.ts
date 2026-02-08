import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { MoodRecordedEvent } from "./events/mood-recorded.event";
import { MoodEntryId } from "./mood-entry-id";
import type { MoodCategory } from "./value-objects/mood-category.vo";
import type { MoodIntensity } from "./value-objects/mood-intensity.vo";

export interface IMoodEntryProps {
  userId: string;
  category: MoodCategory;
  intensity: MoodIntensity;
  createdAt: Date;
  updatedAt: Option<Date>;
}

export interface ICreateMoodEntryProps {
  userId: string;
  category: MoodCategory;
  intensity: MoodIntensity;
}

export class MoodEntry extends Aggregate<IMoodEntryProps> {
  private constructor(props: IMoodEntryProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): MoodEntryId {
    return MoodEntryId.create(this._id);
  }

  static create(
    props: ICreateMoodEntryProps,
    id?: UUID<string | number>,
  ): Result<MoodEntry> {
    const newId = id ?? new UUID<string>();
    const now = new Date();

    const entry = new MoodEntry(
      {
        userId: props.userId,
        category: props.category,
        intensity: props.intensity,
        createdAt: now,
        updatedAt: Option.none(),
      },
      newId,
    );

    entry.addEvent(
      new MoodRecordedEvent(
        newId.value.toString(),
        props.userId,
        props.category.value,
        props.intensity.value,
      ),
    );

    return Result.ok(entry);
  }

  update(category: MoodCategory, intensity: MoodIntensity): void {
    this._props.category = category;
    this._props.intensity = intensity;
    this._props.updatedAt = Option.some(new Date());

    this.addEvent(
      new MoodRecordedEvent(
        this.id.value.toString(),
        this._props.userId,
        category.value,
        intensity.value,
      ),
    );
  }

  static reconstitute(props: IMoodEntryProps, id: MoodEntryId): MoodEntry {
    return new MoodEntry(props, id);
  }
}
