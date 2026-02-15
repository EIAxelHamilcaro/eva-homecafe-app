import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { TableauCreatedEvent } from "./events/tableau-created.event";
import { TableauId } from "./tableau-id";
import type { TableauRow } from "./tableau-row.entity";
import type { TableauTitle } from "./value-objects/tableau-title.vo";

export interface ITableauProps {
  userId: string;
  title: TableauTitle;
  rows: TableauRow[];
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
    },
    id?: UUID<string | number>,
  ): Result<Tableau> {
    const newId = id ?? new UUID<string>();
    const tableau = new Tableau(
      {
        userId: props.userId,
        title: props.title,
        rows: props.rows ?? [],
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
