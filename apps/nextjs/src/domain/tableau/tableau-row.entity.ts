import { Entity, Option, UUID } from "@packages/ddd-kit";
import { TableauRowId } from "./tableau-row-id";
import type { RowName } from "./value-objects/row-name.vo";
import type { RowPriority } from "./value-objects/row-priority.vo";
import type { RowStatus } from "./value-objects/row-status.vo";

export interface ITableauRowProps {
  name: RowName;
  text: Option<string>;
  status: RowStatus;
  priority: RowPriority;
  date: Option<string>;
  files: string[];
  customFields: Record<string, unknown>;
  position: number;
  createdAt: Date;
  updatedAt: Option<Date>;
}

export class TableauRow extends Entity<ITableauRowProps> {
  private constructor(props: ITableauRowProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): TableauRowId {
    return TableauRowId.create(this._id);
  }

  updateName(name: RowName): void {
    this._props.name = name;
    this._props.updatedAt = Option.some(new Date());
  }

  updateText(text: string | undefined): void {
    this._props.text = Option.fromNullable(text ?? null);
    this._props.updatedAt = Option.some(new Date());
  }

  updateStatus(status: RowStatus): void {
    this._props.status = status;
    this._props.updatedAt = Option.some(new Date());
  }

  updatePriority(priority: RowPriority): void {
    this._props.priority = priority;
    this._props.updatedAt = Option.some(new Date());
  }

  updateDate(date: string | undefined): void {
    this._props.date = Option.fromNullable(date ?? null);
    this._props.updatedAt = Option.some(new Date());
  }

  updateFiles(files: string[]): void {
    this._props.files = files;
    this._props.updatedAt = Option.some(new Date());
  }

  updateCustomFields(fields: Record<string, unknown>): void {
    this._props.customFields = { ...this._props.customFields, ...fields };
    this._props.updatedAt = Option.some(new Date());
  }

  removeCustomField(columnId: string): void {
    const { [columnId]: _, ...rest } = this._props.customFields;
    this._props.customFields = rest;
  }

  updatePosition(position: number): void {
    this._props.position = position;
  }

  static create(
    props: {
      name: RowName;
      text?: string;
      status: RowStatus;
      priority: RowPriority;
      date?: string;
      files?: string[];
      customFields?: Record<string, unknown>;
      position: number;
    },
    id?: UUID<string | number>,
  ): TableauRow {
    return new TableauRow(
      {
        name: props.name,
        text: Option.fromNullable(props.text ?? null),
        status: props.status,
        priority: props.priority,
        date: Option.fromNullable(props.date ?? null),
        files: props.files ?? [],
        customFields: props.customFields ?? {},
        position: props.position,
        createdAt: new Date(),
        updatedAt: Option.none(),
      },
      id ?? new UUID(),
    );
  }

  static reconstitute(props: ITableauRowProps, id: TableauRowId): TableauRow {
    return new TableauRow(props, id);
  }
}
