import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { TableauCreatedEvent } from "./events/tableau-created.event";
import { TableauId } from "./tableau-id";
import type { TableauRow } from "./tableau-row.entity";
import type {
  IPriorityOption,
  IStatusOption,
  ITableauColumn,
} from "./tableau-types";
import {
  DEFAULT_PRIORITY_OPTIONS,
  DEFAULT_STATUS_OPTIONS,
} from "./tableau-types";
import type { TableauTitle } from "./value-objects/tableau-title.vo";

export interface ITableauProps {
  userId: string;
  title: TableauTitle;
  rows: TableauRow[];
  statusOptions: IStatusOption[];
  priorityOptions: IPriorityOption[];
  columns: ITableauColumn[];
  createdAt: Date;
  updatedAt: Option<Date>;
}

export class Tableau extends Aggregate<ITableauProps> {
  private constructor(props: ITableauProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): TableauId {
    return TableauId.create(this._id);
  }

  updateTitle(title: TableauTitle): void {
    this._props.title = title;
    this._props.updatedAt = Option.some(new Date());
  }

  updateStatusOptions(options: IStatusOption[]): void {
    this._props.statusOptions = options;
    this._props.updatedAt = Option.some(new Date());
  }

  updatePriorityOptions(options: IPriorityOption[]): void {
    this._props.priorityOptions = options;
    this._props.updatedAt = Option.some(new Date());
  }

  updateColumns(columns: ITableauColumn[]): void {
    this._props.columns = columns;
    this._props.updatedAt = Option.some(new Date());
  }

  addColumn(column: ITableauColumn): void {
    this._props.columns.push(column);
    this._props.updatedAt = Option.some(new Date());
  }

  removeColumn(columnId: string): Result<void> {
    const idx = this._props.columns.findIndex((c) => c.id === columnId);
    if (idx === -1) return Result.fail("Column not found");
    this._props.columns.splice(idx, 1);
    for (const row of this._props.rows) {
      row.removeCustomField(columnId);
    }
    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  addRow(row: TableauRow): void {
    this._props.rows.push(row);
    this._props.updatedAt = Option.some(new Date());
  }

  updateRow(
    rowId: string,
    updates: {
      name?: import("./value-objects/row-name.vo").RowName;
      text?: string | undefined;
      status?: import("./value-objects/row-status.vo").RowStatus;
      priority?: import("./value-objects/row-priority.vo").RowPriority;
      date?: string | undefined;
      files?: string[];
      customFields?: Record<string, unknown>;
    },
  ): Result<void> {
    const row = this._props.rows.find((r) => r.id.value.toString() === rowId);
    if (!row) {
      return Result.fail("Row not found");
    }

    if (updates.name !== undefined) {
      row.updateName(updates.name);
    }
    if ("text" in updates) {
      row.updateText(updates.text);
    }
    if (updates.status !== undefined) {
      row.updateStatus(updates.status);
    }
    if (updates.priority !== undefined) {
      row.updatePriority(updates.priority);
    }
    if ("date" in updates) {
      row.updateDate(updates.date);
    }
    if (updates.files !== undefined) {
      row.updateFiles(updates.files);
    }
    if (updates.customFields !== undefined) {
      row.updateCustomFields(updates.customFields);
    }

    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  removeRow(rowId: string): Result<void> {
    const index = this._props.rows.findIndex(
      (r) => r.id.value.toString() === rowId,
    );
    if (index === -1) {
      return Result.fail("Row not found");
    }
    this._props.rows.splice(index, 1);
    for (const [i, row] of this._props.rows.entries()) {
      row.updatePosition(i);
    }
    this._props.updatedAt = Option.some(new Date());
    return Result.ok();
  }

  static create(
    props: {
      userId: string;
      title: TableauTitle;
      rows?: TableauRow[];
      statusOptions?: IStatusOption[];
      priorityOptions?: IPriorityOption[];
      columns?: ITableauColumn[];
    },
    id?: UUID<string | number>,
  ): Result<Tableau> {
    const newId = id ?? new UUID<string>();
    const tableau = new Tableau(
      {
        userId: props.userId,
        title: props.title,
        rows: props.rows ?? [],
        statusOptions: props.statusOptions ?? DEFAULT_STATUS_OPTIONS,
        priorityOptions: props.priorityOptions ?? DEFAULT_PRIORITY_OPTIONS,
        columns: props.columns ?? [],
        createdAt: new Date(),
        updatedAt: Option.none(),
      },
      newId,
    );

    tableau.addEvent(
      new TableauCreatedEvent(newId.value.toString(), props.userId),
    );

    return Result.ok(tableau);
  }

  static reconstitute(props: ITableauProps, id: TableauId): Tableau {
    return new Tableau(props, id);
  }
}
