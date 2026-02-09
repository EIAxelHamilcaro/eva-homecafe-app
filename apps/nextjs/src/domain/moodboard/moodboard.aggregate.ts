import { Aggregate, Result, UUID } from "@packages/ddd-kit";
import { MoodboardCreatedEvent } from "./events/moodboard-created.event";
import { MoodboardId } from "./moodboard-id";
import type { Pin } from "./pin.entity";
import type { MoodboardTitle } from "./value-objects/moodboard-title.vo";

export interface IMoodboardProps {
  userId: string;
  title: MoodboardTitle;
  pins: Pin[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface ICreateMoodboardProps {
  userId: string;
  title: MoodboardTitle;
}

export class Moodboard extends Aggregate<IMoodboardProps> {
  private constructor(props: IMoodboardProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): MoodboardId {
    return MoodboardId.create(this._id);
  }

  static create(
    props: ICreateMoodboardProps,
    id?: UUID<string | number>,
  ): Result<Moodboard> {
    const newId = id ?? new UUID<string>();
    const now = new Date();

    const moodboard = new Moodboard(
      {
        userId: props.userId,
        title: props.title,
        pins: [],
        createdAt: now,
      },
      newId,
    );

    moodboard.addEvent(
      new MoodboardCreatedEvent(
        newId.value.toString(),
        props.userId,
        props.title.value,
      ),
    );

    return Result.ok(moodboard);
  }

  static reconstitute(props: IMoodboardProps, id: MoodboardId): Moodboard {
    return new Moodboard(props, id);
  }
}
