import { Entity, UUID } from "@packages/ddd-kit";
import { ChronologieEntryId } from "./chronologie-entry-id";
import type { IChronologieEntryProps } from "./chronologie-types";
import type { EntryTitle } from "./value-objects/entry-title.vo";

export class ChronologieEntry extends Entity<IChronologieEntryProps> {
  private constructor(
    props: IChronologieEntryProps,
    id?: UUID<string | number>,
  ) {
    super(props, id);
  }

  get id(): ChronologieEntryId {
    return ChronologieEntryId.create(this._id);
  }

  updateTitle(title: EntryTitle): void {
    this._props.title = title.value;
    this._props.updatedAt = new Date();
  }

  updateStartDate(date: string | null): void {
    this._props.startDate = date;
    this._props.updatedAt = new Date();
  }

  updateEndDate(date: string | null): void {
    this._props.endDate = date;
    this._props.updatedAt = new Date();
  }

  updateColor(color: number): void {
    this._props.color = color;
    this._props.updatedAt = new Date();
  }

  updatePosition(position: number): void {
    this._props.position = position;
  }

  static create(
    props: {
      title: string;
      startDate?: string | null;
      endDate?: string | null;
      color?: number;
      position: number;
    },
    id?: UUID<string | number>,
  ): ChronologieEntry {
    return new ChronologieEntry(
      {
        title: props.title,
        startDate: props.startDate ?? null,
        endDate: props.endDate ?? null,
        color: props.color ?? 0,
        position: props.position,
        createdAt: new Date(),
        updatedAt: null,
      },
      id ?? new UUID(),
    );
  }

  static reconstitute(
    props: IChronologieEntryProps,
    id: ChronologieEntryId,
  ): ChronologieEntry {
    return new ChronologieEntry(props, id);
  }
}
