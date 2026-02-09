import { Aggregate, Result, UUID } from "@packages/ddd-kit";
import { MoodboardCreatedEvent } from "./events/moodboard-created.event";
import { MoodboardDeletedEvent } from "./events/moodboard-deleted.event";
import { PinAddedEvent } from "./events/pin-added.event";
import { PinRemovedEvent } from "./events/pin-removed.event";
import { MoodboardId } from "./moodboard-id";
import type { Pin } from "./pin.entity";
import type { PinId } from "./pin-id";
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

const MAX_PINS = 50;

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

  addPin(pin: Pin): Result<void> {
    const isDuplicate = this._props.pins.some(
      (p) => p.id.value.toString() === pin.id.value.toString(),
    );
    if (isDuplicate) {
      return Result.fail("Pin already exists in this moodboard");
    }
    if (this._props.pins.length >= MAX_PINS) {
      return Result.fail(`Moodboard cannot have more than ${MAX_PINS} pins`);
    }
    this._props.pins.push(pin);
    this._props.updatedAt = new Date();
    this.addEvent(
      new PinAddedEvent(
        this.id.value.toString(),
        pin.id.value.toString(),
        pin.get("type").value,
      ),
    );
    return Result.ok(undefined);
  }

  markForDeletion(): Result<void> {
    this.addEvent(
      new MoodboardDeletedEvent(this.id.value.toString(), this._props.userId),
    );
    return Result.ok(undefined);
  }

  removePin(pinId: PinId): Result<void> {
    const index = this._props.pins.findIndex(
      (p) => p.id.value.toString() === pinId.value.toString(),
    );
    if (index === -1) {
      return Result.fail("Pin not found");
    }
    this._props.pins.splice(index, 1);
    for (let i = 0; i < this._props.pins.length; i++) {
      const pin = this._props.pins[i];
      if (pin) {
        pin.updatePosition(i);
      }
    }
    this._props.updatedAt = new Date();
    this.addEvent(
      new PinRemovedEvent(this.id.value.toString(), pinId.value.toString()),
    );
    return Result.ok(undefined);
  }

  static reconstitute(props: IMoodboardProps, id: MoodboardId): Moodboard {
    return new Moodboard(props, id);
  }
}
