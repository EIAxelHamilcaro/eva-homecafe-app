import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { ChronologieEntry } from "./chronologie-entry.entity";
import type { ChronologieEntryId } from "./chronologie-entry-id";
import { ChronologieId } from "./chronologie-id";
import { ChronologieCreatedEvent } from "./events/chronologie-created.event";
import type { ChronologieTitle } from "./value-objects/chronologie-title.vo";
import type { EntryTitle } from "./value-objects/entry-title.vo";

export interface IChronologieProps {
  title: ChronologieTitle;
  userId: string;
  entries: ChronologieEntry[];
  createdAt: Date;
  updatedAt: Option<Date>;
}

export class Chronologie extends Aggregate<IChronologieProps> {
  private constructor(props: IChronologieProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): ChronologieId {
    return ChronologieId.create(this._id);
  }

  updateTitle(title: ChronologieTitle): void {
    this._props.title = title;
    this._props.updatedAt = Option.some(new Date());
  }

  addEntry(props: {
    title: string;
    startDate?: string | null;
    endDate?: string | null;
    color?: number;
  }): ChronologieEntry {
    const position = this._props.entries.length;
    const entry = ChronologieEntry.create({
      title: props.title,
      startDate: props.startDate,
      endDate: props.endDate,
      color: props.color,
      position,
    });
    this._props.entries.push(entry);
    this._props.updatedAt = Option.some(new Date());
    return entry;
  }

  removeEntry(entryId: ChronologieEntryId): Result<void> {
    const index = this._props.entries.findIndex(
      (e) => e.id.value.toString() === entryId.value.toString(),
    );
    if (index === -1) {
      return Result.fail("Entry not found");
    }
    this._props.entries.splice(index, 1);
    for (const [i, entry] of this._props.entries.entries()) {
      entry.updatePosition(i);
    }
    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  updateEntry(
    entryId: string,
    updates: {
      title?: EntryTitle;
      startDate?: string | null;
      endDate?: string | null;
      color?: number;
    },
  ): Result<void> {
    const entry = this._props.entries.find(
      (e) => e.id.value.toString() === entryId,
    );
    if (!entry) {
      return Result.fail("Entry not found");
    }

    if (updates.title !== undefined) {
      entry.updateTitle(updates.title);
    }
    if ("startDate" in updates) {
      entry.updateStartDate(updates.startDate ?? null);
    }
    if ("endDate" in updates) {
      entry.updateEndDate(updates.endDate ?? null);
    }
    if (updates.color !== undefined) {
      entry.updateColor(updates.color);
    }

    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  static create(
    props: {
      userId: string;
      title: ChronologieTitle;
    },
    id?: UUID<string | number>,
  ): Result<Chronologie> {
    const newId = id ?? new UUID<string>();
    const chronologie = new Chronologie(
      {
        userId: props.userId,
        title: props.title,
        entries: [],
        createdAt: new Date(),
        updatedAt: Option.none(),
      },
      newId,
    );

    chronologie.addEvent(
      new ChronologieCreatedEvent(newId.value.toString(), props.userId),
    );

    return Result.ok(chronologie);
  }

  static reconstitute(
    props: IChronologieProps,
    id: ChronologieId,
  ): Chronologie {
    return new Chronologie(props, id);
  }
}
