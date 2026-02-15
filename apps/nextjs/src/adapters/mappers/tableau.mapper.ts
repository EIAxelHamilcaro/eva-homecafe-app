import { Option, Result, UUID } from "@packages/ddd-kit";
import type {
  tableauRow as tableauRowTable,
  tableau as tableauTable,
} from "@packages/drizzle/schema";
import {
  DEFAULT_COLUMN_ORDER,
  Tableau,
} from "@/domain/tableau/tableau.aggregate";
import { TableauId } from "@/domain/tableau/tableau-id";
import { TableauRow } from "@/domain/tableau/tableau-row.entity";
import { TableauRowId } from "@/domain/tableau/tableau-row-id";
import type {
  IPriorityOption,
  IStatusOption,
  ITableauColumn,
} from "@/domain/tableau/tableau-types";
import {
  DEFAULT_PRIORITY_OPTIONS,
  DEFAULT_STATUS_OPTIONS,
} from "@/domain/tableau/tableau-types";
import { RowName } from "@/domain/tableau/value-objects/row-name.vo";
import { RowPriority } from "@/domain/tableau/value-objects/row-priority.vo";
import { RowStatus } from "@/domain/tableau/value-objects/row-status.vo";
import { TableauTitle } from "@/domain/tableau/value-objects/tableau-title.vo";

type TableauRecord = typeof tableauTable.$inferSelect;
type RowRecord = typeof tableauRowTable.$inferSelect;

export function tableauToDomain(
  tableauRecord: TableauRecord,
  rowRecords: RowRecord[],
): Result<Tableau> {
  const titleResult = TableauTitle.create(tableauRecord.title);
  if (titleResult.isFailure) {
    return Result.fail(titleResult.getError());
  }

  const rows: TableauRow[] = [];
  for (const rr of rowRecords) {
    const nameResult = RowName.create(rr.name);
    if (nameResult.isFailure) {
      return Result.fail(nameResult.getError());
    }

    const statusResult = RowStatus.create(rr.status);
    if (statusResult.isFailure) {
      return Result.fail(statusResult.getError());
    }

    const priorityResult = RowPriority.create(rr.priority);
    if (priorityResult.isFailure) {
      return Result.fail(priorityResult.getError());
    }

    rows.push(
      TableauRow.reconstitute(
        {
          name: nameResult.getValue(),
          text: Option.fromNullable(rr.text),
          status: statusResult.getValue(),
          priority: priorityResult.getValue(),
          date: Option.fromNullable(rr.date),
          files: (rr.files as string[]) ?? [],
          customFields: (rr.customFields as Record<string, unknown>) ?? {},
          position: rr.position,
          createdAt: rr.createdAt,
          updatedAt: Option.fromNullable(rr.updatedAt),
        },
        TableauRowId.create(new UUID(rr.id)),
      ),
    );
  }

  const tableau = Tableau.reconstitute(
    {
      userId: tableauRecord.userId,
      title: titleResult.getValue(),
      rows,
      statusOptions:
        (tableauRecord.statusOptions as IStatusOption[]) ??
        DEFAULT_STATUS_OPTIONS,
      priorityOptions:
        (tableauRecord.priorityOptions as IPriorityOption[]) ??
        DEFAULT_PRIORITY_OPTIONS,
      columns: (tableauRecord.columns as ITableauColumn[]) ?? [],
      columnOrder:
        (tableauRecord.columnOrder as string[]) ?? DEFAULT_COLUMN_ORDER,
      createdAt: tableauRecord.createdAt,
      updatedAt: Option.fromNullable(tableauRecord.updatedAt),
    },
    TableauId.create(new UUID(tableauRecord.id)),
  );

  return Result.ok(tableau);
}

export function tableauToPersistence(tableau: Tableau) {
  const updatedAt = tableau.get("updatedAt");
  return {
    tableau: {
      id: tableau.id.value.toString(),
      userId: tableau.get("userId"),
      title: tableau.get("title").value,
      statusOptions: tableau.get("statusOptions"),
      priorityOptions: tableau.get("priorityOptions"),
      columns: tableau.get("columns"),
      columnOrder: tableau.get("columnOrder"),
      createdAt: tableau.get("createdAt"),
      updatedAt: updatedAt.isSome() ? updatedAt.unwrap() : null,
    },
    rows: tableau.get("rows").map((row) => {
      const rowUpdatedAt = row.get("updatedAt");
      const rowText = row.get("text");
      const rowDate = row.get("date");
      return {
        id: row.id.value.toString(),
        tableauId: tableau.id.value.toString(),
        name: row.get("name").value,
        text: rowText.isSome() ? rowText.unwrap() : null,
        status: row.get("status").value,
        priority: row.get("priority").value,
        date: rowDate.isSome() ? rowDate.unwrap() : null,
        files: row.get("files"),
        customFields: row.get("customFields"),
        position: row.get("position"),
        createdAt: row.get("createdAt"),
        updatedAt: rowUpdatedAt.isSome() ? rowUpdatedAt.unwrap() : null,
      };
    }),
  };
}
