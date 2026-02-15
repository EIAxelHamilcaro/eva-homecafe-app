# Tableau Interactif & Personnalisable — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transformer le tableau en expérience entièrement éditable inline avec colonnes dynamiques et statuts/priorités personnalisables.

**Architecture:** Le backend supporte déjà l'update de name/text/date/files via `UpdateTableauRowUseCase`. On ajoute `statusOptions`, `priorityOptions` et `columns` (JSONB) sur le tableau + `customFields` (JSONB) sur les rows. Côté frontend, pattern click-to-edit pour toutes les cellules.

**Tech Stack:** Drizzle (schema), PostgreSQL (JSONB), React (inline editing), shadcn/ui (Calendar, Popover, Select, Input, Checkbox)

---

## Task 1: Schema Migration

**Files:**
- Modify: `packages/drizzle/src/schema/tableau.ts`

**Step 1: Update the schema**

Remplacer les enums `status`/`priority` par `text`. Ajouter `statusOptions`, `priorityOptions`, `columns` JSONB sur `tableau`. Ajouter `customFields` JSONB sur `tableau_row`.

```typescript
// packages/drizzle/src/schema/tableau.ts
import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const tableau = pgTable(
  "tableau",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    statusOptions: jsonb("status_options")
      .$type<{ id: string; label: string; color: string }[]>()
      .notNull()
      .default([
        { id: "todo", label: "À faire", color: "#dbeafe" },
        { id: "in_progress", label: "En cours", color: "#ffedd5" },
        { id: "waiting", label: "En attente", color: "#fef3c7" },
        { id: "done", label: "Terminé", color: "#dcfce7" },
      ]),
    priorityOptions: jsonb("priority_options")
      .$type<{ id: string; label: string; level: number }[]>()
      .notNull()
      .default([
        { id: "low", label: "Basse", level: 1 },
        { id: "medium", label: "Moyenne", level: 2 },
        { id: "high", label: "Haute", level: 3 },
        { id: "critical", label: "Critique", level: 4 },
      ]),
    columns: jsonb("columns")
      .$type<
        {
          id: string;
          name: string;
          type: "text" | "number" | "checkbox" | "date" | "select";
          position: number;
          options?: { id: string; label: string; color?: string }[];
        }[]
      >()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [index("tableau_user_id_idx").on(table.userId)],
);

export const tableauRow = pgTable(
  "tableau_row",
  {
    id: text("id").primaryKey(),
    tableauId: text("tableau_id")
      .notNull()
      .references(() => tableau.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    text: text("text"),
    status: text("status").notNull().default("todo"),
    priority: text("priority").notNull().default("medium"),
    date: date("date", { mode: "string" }),
    files: jsonb("files").$type<string[]>().notNull().default([]),
    customFields: jsonb("custom_fields")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("tableau_row_tableau_id_position_idx").on(
      table.tableauId,
      table.position,
    ),
  ],
);
```

Note: On supprime les `pgEnum` `tableauRowStatusEnum` et `tableauRowPriorityEnum`. Vérifier qu'ils ne sont importés nulle part ailleurs (ils ne le sont pas — seul le schema les utilise).

**Step 2: Push schema**

Run: `pnpm db:push`

**Step 3: Commit**

```bash
git add packages/drizzle/src/schema/tableau.ts
git commit -m "feat(schema): add custom columns, status/priority options to tableau"
```

---

## Task 2: Domain Layer Updates

**Files:**
- Modify: `apps/nextjs/src/domain/tableau/value-objects/row-status.vo.ts`
- Modify: `apps/nextjs/src/domain/tableau/value-objects/row-priority.vo.ts`
- Modify: `apps/nextjs/src/domain/tableau/tableau.aggregate.ts`
- Modify: `apps/nextjs/src/domain/tableau/tableau-row.entity.ts`

**Step 1: Relax RowStatus to accept any non-empty string**

```typescript
// apps/nextjs/src/domain/tableau/value-objects/row-status.vo.ts
import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const rowStatusValues = [
  "todo",
  "in_progress",
  "waiting",
  "done",
] as const;
export type RowStatusValue = (typeof rowStatusValues)[number];

const schema = z.string().min(1, "Status cannot be empty");

export class RowStatus extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid row status");
    }
    return Result.ok(result.data);
  }
}
```

Note: On garde `rowStatusValues` exporté pour les valeurs par défaut, mais on ne valide plus contre eux.

**Step 2: Relax RowPriority similarly**

```typescript
// apps/nextjs/src/domain/tableau/value-objects/row-priority.vo.ts
import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const rowPriorityValues = ["low", "medium", "high", "critical"] as const;
export type RowPriorityValue = (typeof rowPriorityValues)[number];

const schema = z.string().min(1, "Priority cannot be empty");

export class RowPriority extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid row priority");
    }
    return Result.ok(result.data);
  }
}
```

**Step 3: Add types for tableau options/columns**

Create a shared types file:

```typescript
// apps/nextjs/src/domain/tableau/tableau-types.ts
export interface IStatusOption {
  id: string;
  label: string;
  color: string;
}

export interface IPriorityOption {
  id: string;
  label: string;
  level: number;
}

export interface IColumnOption {
  id: string;
  label: string;
  color?: string;
}

export type TableauColumnType = "text" | "number" | "checkbox" | "date" | "select";

export interface ITableauColumn {
  id: string;
  name: string;
  type: TableauColumnType;
  position: number;
  options?: IColumnOption[];
}

export const DEFAULT_STATUS_OPTIONS: IStatusOption[] = [
  { id: "todo", label: "À faire", color: "#dbeafe" },
  { id: "in_progress", label: "En cours", color: "#ffedd5" },
  { id: "waiting", label: "En attente", color: "#fef3c7" },
  { id: "done", label: "Terminé", color: "#dcfce7" },
];

export const DEFAULT_PRIORITY_OPTIONS: IPriorityOption[] = [
  { id: "low", label: "Basse", level: 1 },
  { id: "medium", label: "Moyenne", level: 2 },
  { id: "high", label: "Haute", level: 3 },
  { id: "critical", label: "Critique", level: 4 },
];
```

**Step 4: Update Tableau aggregate**

Add `statusOptions`, `priorityOptions`, `columns` to `ITableauProps`. Add methods: `updateTitle`, `updateStatusOptions`, `updatePriorityOptions`, `addColumn`, `removeColumn`, `updateColumn`.

```typescript
// apps/nextjs/src/domain/tableau/tableau.aggregate.ts
import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { TableauCreatedEvent } from "./events/tableau-created.event";
import { TableauId } from "./tableau-id";
import type { TableauRow } from "./tableau-row.entity";
import type {
  IStatusOption,
  IPriorityOption,
  ITableauColumn,
} from "./tableau-types";
import {
  DEFAULT_STATUS_OPTIONS,
  DEFAULT_PRIORITY_OPTIONS,
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
```

**Step 5: Update TableauRow entity**

Add `customFields: Record<string, unknown>`, `updateCustomFields()`, `removeCustomField()`.

```typescript
// apps/nextjs/src/domain/tableau/tableau-row.entity.ts
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
```

**Step 6: Commit**

```bash
git add apps/nextjs/src/domain/tableau/
git commit -m "feat(domain): add custom columns, options & customFields to tableau"
```

---

## Task 3: Mapper & DTO Updates

**Files:**
- Modify: `apps/nextjs/src/application/dto/tableau/common-tableau.dto.ts`
- Modify: `apps/nextjs/src/application/dto/tableau/tableau-dto.mapper.ts`
- Modify: `apps/nextjs/src/application/dto/tableau/update-row.dto.ts`
- Modify: `apps/nextjs/src/adapters/mappers/tableau.mapper.ts`

**Step 1: Update common DTO schema**

Add `statusOptions`, `priorityOptions`, `columns` to `tableauDtoSchema`. Add `customFields` to `tableauRowDtoSchema`. Remove enum imports — use plain `z.string()` for status/priority.

```typescript
// apps/nextjs/src/application/dto/tableau/common-tableau.dto.ts
import { z } from "zod";

export const statusOptionDtoSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
});

export const priorityOptionDtoSchema = z.object({
  id: z.string(),
  label: z.string(),
  level: z.number(),
});

export const columnOptionDtoSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string().optional(),
});

export const tableauColumnDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["text", "number", "checkbox", "date", "select"]),
  position: z.number(),
  options: z.array(columnOptionDtoSchema).optional(),
});

export const tableauRowDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  text: z.string().nullable(),
  status: z.string(),
  priority: z.string(),
  date: z.string().nullable(),
  files: z.array(z.string()),
  customFields: z.record(z.unknown()),
  position: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export const tableauDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  rows: z.array(tableauRowDtoSchema),
  statusOptions: z.array(statusOptionDtoSchema),
  priorityOptions: z.array(priorityOptionDtoSchema),
  columns: z.array(tableauColumnDtoSchema),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type IStatusOptionDto = z.infer<typeof statusOptionDtoSchema>;
export type IPriorityOptionDto = z.infer<typeof priorityOptionDtoSchema>;
export type ITableauColumnDto = z.infer<typeof tableauColumnDtoSchema>;
export type ITableauRowDto = z.infer<typeof tableauRowDtoSchema>;
export type ITableauDto = z.infer<typeof tableauDtoSchema>;
```

**Step 2: Update tableau DTO mapper**

Add `statusOptions`, `priorityOptions`, `columns` and `customFields` to the output.

```typescript
// apps/nextjs/src/application/dto/tableau/tableau-dto.mapper.ts
import { match } from "@packages/ddd-kit";
import type { Tableau } from "@/domain/tableau/tableau.aggregate";
import type { ITableauDto } from "./common-tableau.dto";

export function tableauToDto(tableau: Tableau): ITableauDto {
  return {
    id: tableau.id.value.toString(),
    title: tableau.get("title").value,
    statusOptions: tableau.get("statusOptions"),
    priorityOptions: tableau.get("priorityOptions"),
    columns: tableau.get("columns"),
    rows: tableau
      .get("rows")
      .sort((a, b) => a.get("position") - b.get("position"))
      .map((row) => ({
        id: row.id.value.toString(),
        name: row.get("name").value,
        text: match<string, string | null>(row.get("text"), {
          Some: (t) => t,
          None: () => null,
        }),
        status: row.get("status").value,
        priority: row.get("priority").value,
        date: match<string, string | null>(row.get("date"), {
          Some: (d) => d,
          None: () => null,
        }),
        files: row.get("files"),
        customFields: row.get("customFields"),
        position: row.get("position"),
        createdAt: row.get("createdAt").toISOString(),
        updatedAt: match<Date, string | null>(row.get("updatedAt"), {
          Some: (d) => d.toISOString(),
          None: () => null,
        }),
      })),
    createdAt: tableau.get("createdAt").toISOString(),
    updatedAt: match<Date, string | null>(tableau.get("updatedAt"), {
      Some: (d) => d.toISOString(),
      None: () => null,
    }),
  };
}
```

**Step 3: Update persistence mapper**

Add new fields to `tableauToDomain` and `tableauToPersistence`. Remove enum type assertions.

In `tableauToDomain`: read `statusOptions`, `priorityOptions`, `columns` from record; read `customFields` from row records.

In `tableauToPersistence`: persist new fields. Remove `as "todo" | ...` casts — they're just strings now.

```typescript
// apps/nextjs/src/adapters/mappers/tableau.mapper.ts
// Key changes in tableauToDomain:
// - Add to reconstitute: statusOptions, priorityOptions, columns from tableauRecord
// - Add to row reconstitute: customFields from rr.customFields ?? {}

// Key changes in tableauToPersistence:
// - Add to tableau object: statusOptions, priorityOptions, columns
// - Add to row object: customFields
// - Remove "as" type casts for status/priority
```

See full implementation in the code — update both functions to pass through the new JSONB fields.

**Step 4: Update update-row DTO**

Add `customFields` field. Remove enum imports.

```typescript
// apps/nextjs/src/application/dto/tableau/update-row.dto.ts
import { z } from "zod";
import type { tableauDtoSchema } from "./common-tableau.dto";

export const updateRowInputDtoSchema = z.object({
  tableauId: z.string().min(1),
  rowId: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1).max(200).optional(),
  text: z.string().optional(),
  status: z.string().min(1).optional(),
  priority: z.string().min(1).optional(),
  date: z.string().optional(),
  files: z.array(z.string()).optional(),
  customFields: z.record(z.unknown()).optional(),
});

export type IUpdateRowInputDto = z.infer<typeof updateRowInputDtoSchema>;
export type IUpdateRowOutputDto = z.infer<typeof tableauDtoSchema>;
```

**Step 5: Similarly update `add-row.dto.ts`** — add `customFields`, remove enum imports.

**Step 6: Commit**

```bash
git add apps/nextjs/src/application/dto/tableau/ apps/nextjs/src/adapters/mappers/tableau.mapper.ts
git commit -m "feat(dto/mapper): add custom columns & options to tableau DTOs"
```

---

## Task 4: UpdateTableau Use Case + Controller + Route

**Files:**
- Create: `apps/nextjs/src/application/dto/tableau/update-tableau.dto.ts`
- Create: `apps/nextjs/src/application/use-cases/tableau/update-tableau.use-case.ts`
- Modify: `apps/nextjs/common/di/types.ts` (add DI symbol)
- Modify: `apps/nextjs/common/di/modules/tableau.module.ts` (register)
- Modify: `apps/nextjs/src/adapters/controllers/tableau/tableau.controller.ts` (add controller)
- Modify: `apps/nextjs/app/api/v1/tableaux/[tableauId]/route.ts` (add PATCH)

**Step 1: Create update-tableau DTO**

```typescript
// apps/nextjs/src/application/dto/tableau/update-tableau.dto.ts
import { z } from "zod";
import {
  statusOptionDtoSchema,
  priorityOptionDtoSchema,
  tableauColumnDtoSchema,
  type tableauDtoSchema,
} from "./common-tableau.dto";

export const updateTableauInputDtoSchema = z.object({
  tableauId: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  statusOptions: z.array(statusOptionDtoSchema).min(1).optional(),
  priorityOptions: z.array(priorityOptionDtoSchema).min(1).optional(),
  columns: z.array(tableauColumnDtoSchema).optional(),
});

export type IUpdateTableauInputDto = z.infer<typeof updateTableauInputDtoSchema>;
export type IUpdateTableauOutputDto = z.infer<typeof tableauDtoSchema>;
```

**Step 2: Create UpdateTableauUseCase**

```typescript
// apps/nextjs/src/application/use-cases/tableau/update-tableau.use-case.ts
import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import { tableauToDto } from "@/application/dto/tableau/tableau-dto.mapper";
import type {
  IUpdateTableauInputDto,
  IUpdateTableauOutputDto,
} from "@/application/dto/tableau/update-tableau.dto";
import type { ITableauRepository } from "@/application/ports/tableau-repository.port";
import { TableauId } from "@/domain/tableau/tableau-id";
import { TableauTitle } from "@/domain/tableau/value-objects/tableau-title.vo";

export class UpdateTableauUseCase
  implements UseCase<IUpdateTableauInputDto, IUpdateTableauOutputDto>
{
  constructor(private readonly tableauRepo: ITableauRepository) {}

  async execute(
    input: IUpdateTableauInputDto,
  ): Promise<Result<IUpdateTableauOutputDto>> {
    const tableauId = TableauId.create(new UUID(input.tableauId));
    const findResult = await this.tableauRepo.findById(tableauId);

    if (findResult.isFailure) return Result.fail(findResult.getError());

    const option = findResult.getValue();
    if (option.isNone()) return Result.fail("Tableau not found");

    const tableau = option.unwrap();
    if (tableau.get("userId") !== input.userId) return Result.fail("Forbidden");

    if (input.title !== undefined) {
      const titleResult = TableauTitle.create(input.title);
      if (titleResult.isFailure) return Result.fail(titleResult.getError());
      tableau.updateTitle(titleResult.getValue());
    }

    if (input.statusOptions !== undefined) {
      tableau.updateStatusOptions(input.statusOptions);
    }

    if (input.priorityOptions !== undefined) {
      tableau.updatePriorityOptions(input.priorityOptions);
    }

    if (input.columns !== undefined) {
      tableau.updateColumns(input.columns);
    }

    const saveResult = await this.tableauRepo.update(tableau);
    if (saveResult.isFailure) return Result.fail(saveResult.getError());

    return Result.ok(tableauToDto(tableau));
  }
}
```

**Step 3: Register in DI**

In `types.ts`: add `UpdateTableauUseCase` to DI_SYMBOLS and DI_RETURN_TYPES (+ import).

In `tableau.module.ts`: bind `UpdateTableauUseCase` with `[DI_SYMBOLS.ITableauRepository]`.

**Step 4: Add controller function**

Add `updateTableauController` to `tableau.controller.ts` — similar to existing pattern. Parses body with `updateTableauInputDtoSchema`, calls `UpdateTableauUseCase`.

**Step 5: Add PATCH route**

```typescript
// apps/nextjs/app/api/v1/tableaux/[tableauId]/route.ts
import {
  deleteTableauController,
  updateTableauController,
} from "@/adapters/controllers/tableau/tableau.controller";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tableauId: string }> },
) {
  const { tableauId } = await params;
  return deleteTableauController(request, tableauId);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tableauId: string }> },
) {
  const { tableauId } = await params;
  return updateTableauController(request, tableauId);
}
```

**Step 6: Update UpdateTableauRowUseCase** to pass `customFields` through to `tableau.updateRow()`.

**Step 7: Commit**

```bash
git add apps/nextjs/src/application/use-cases/tableau/ apps/nextjs/src/application/dto/tableau/ apps/nextjs/common/di/ apps/nextjs/src/adapters/controllers/tableau/ apps/nextjs/app/api/v1/tableaux/
git commit -m "feat(backend): add UpdateTableau use case + PATCH endpoint"
```

---

## Task 5: Frontend Hook + Update Mutation

**Files:**
- Modify: `apps/nextjs/app/(protected)/_hooks/use-tableaux.ts`

**Step 1: Add `useUpdateTableauMutation`**

```typescript
export function useUpdateTableauMutation(tableauId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    ITableauDto,
    Error,
    {
      title?: string;
      statusOptions?: IStatusOptionDto[];
      priorityOptions?: IPriorityOptionDto[];
      columns?: ITableauColumnDto[];
    }
  >({
    mutationFn: (input) =>
      apiFetch<ITableauDto>(`/api/v1/tableaux/${tableauId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableauKeys.all });
    },
  });
}
```

**Step 2: Update `useUpdateRowMutation`** — add `customFields` to accepted input type.

**Step 3: Commit**

```bash
git add apps/nextjs/app/(protected)/_hooks/use-tableaux.ts
git commit -m "feat(hooks): add useUpdateTableauMutation + customFields support"
```

---

## Task 6: Frontend — Inline Editing Components

**Files:**
- Create: `apps/nextjs/app/(protected)/organization/_components/editable-text.tsx`
- Create: `apps/nextjs/app/(protected)/organization/_components/date-picker-cell.tsx`

**Step 1: Create EditableText component**

Click-to-edit pattern: text → input → blur/enter saves, escape cancels.

```typescript
// apps/nextjs/app/(protected)/organization/_components/editable-text.tsx
"use client";

import { Input } from "@packages/ui/components/ui/input";
import { useEffect, useRef, useState } from "react";

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  as?: "span" | "h3" | "p";
}

export function EditableText({
  value,
  onSave,
  placeholder = "Cliquer pour éditer",
  className = "",
  inputClassName = "",
  as: Tag = "span",
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleSave = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    } else {
      setDraft(value);
    }
  };

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`h-7 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-1 ${inputClassName}`}
      />
    );
  }

  return (
    <Tag
      className={`cursor-pointer rounded px-1 py-0.5 hover:bg-muted/50 ${className}`}
      onClick={() => setEditing(true)}
    >
      {value || <span className="text-muted-foreground">{placeholder}</span>}
    </Tag>
  );
}
```

**Step 2: Create DatePickerCell component**

Uses Popover + Calendar from shadcn.

```typescript
// apps/nextjs/app/(protected)/organization/_components/date-picker-cell.tsx
"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Calendar } from "@packages/ui/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@packages/ui/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";

interface DatePickerCellProps {
  value: string | null;
  onSave: (date: string | undefined) => void;
}

export function DatePickerCell({ value, onSave }: DatePickerCellProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-7 cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-sm hover:bg-muted/50"
        >
          {value ? (
            new Date(value).toLocaleDateString("fr-FR")
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5" />
              —
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onSave(date?.toISOString().split("T")[0]);
            setOpen(false);
          }}
        />
        {value && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                onSave(undefined);
                setOpen(false);
              }}
            >
              <X className="mr-1 h-3 w-3" /> Retirer la date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
```

**Step 3: Commit**

```bash
git add apps/nextjs/app/(protected)/organization/_components/editable-text.tsx apps/nextjs/app/(protected)/organization/_components/date-picker-cell.tsx
git commit -m "feat(ui): add EditableText and DatePickerCell components"
```

---

## Task 7: Frontend — Refactor TableauBoard (Inline Editing)

**Files:**
- Modify: `apps/nextjs/app/(protected)/organization/_components/tableau-board.tsx`

**Step 1: Apply inline editing**

Major changes:
1. Titre du tableau → `<EditableText as="h3">` avec `useUpdateTableauMutation`
2. Nom de ligne → `<EditableText>` avec `updateRow.mutate({ rowId, name })`
3. Texte de ligne → `<EditableText>` avec `updateRow.mutate({ rowId, text })`
4. Date → `<DatePickerCell>` avec `updateRow.mutate({ rowId, date })`
5. Fichiers → `<button>` qui trigger un `<input type="file" hidden>` + upload
6. Status/Priority Select → utiliser `tableau.statusOptions` et `tableau.priorityOptions` au lieu des constantes
7. StatusBadge/PriorityBars → dynamiques selon les options du tableau

**Step 2: Remove hardcoded STATUS_OPTIONS and PRIORITY_OPTIONS**

Replace with props from `tableau.statusOptions` and `tableau.priorityOptions`.

**Step 3: Pass `tableau` to `RowItem`**

RowItem needs the full tableau to access statusOptions/priorityOptions.

```typescript
function RowItem({
  row,
  tableau,
}: {
  row: ITableauRowDto;
  tableau: ITableauDto;
}) {
  // ...
}
```

**Step 4: Commit**

```bash
git add apps/nextjs/app/(protected)/organization/_components/tableau-board.tsx
git commit -m "feat(ui): inline editing for title, name, text, date, files"
```

---

## Task 8: Frontend — Custom Status/Priority Editors

**Files:**
- Create: `apps/nextjs/app/(protected)/organization/_components/options-editor.tsx`
- Modify: `apps/nextjs/app/(protected)/organization/_components/tableau-board.tsx`

**Step 1: Create OptionsEditor component**

A Popover that shows a list of options with editable labels and colors. Used for both statuses and priorities.

Features:
- List of options with inline-editable label
- Color picker (simple preset colors) for status
- Add new option button
- Delete option (with confirm if rows use it)
- Drag to reorder (optional — skip for v1, just position by array order)

```typescript
// apps/nextjs/app/(protected)/organization/_components/options-editor.tsx
// Reusable editor for status options and priority options
// - Renders inside a Popover
// - Each option: editable label + color swatch (for status) or level (for priority)
// - "+" to add, trash to remove
// - Saves on change via onSave callback
```

**Step 2: Wire into TableauBoard headers**

The "État" header gets a small edit button → opens OptionsEditor for statusOptions.
The "Priorité" header gets the same → opens OptionsEditor for priorityOptions.
On save → calls `updateTableau.mutate({ statusOptions: [...] })`.

**Step 3: Commit**

```bash
git add apps/nextjs/app/(protected)/organization/_components/options-editor.tsx apps/nextjs/app/(protected)/organization/_components/tableau-board.tsx
git commit -m "feat(ui): editable status/priority options via popover"
```

---

## Task 9: Frontend — Custom Columns

**Files:**
- Create: `apps/nextjs/app/(protected)/organization/_components/add-column-popover.tsx`
- Create: `apps/nextjs/app/(protected)/organization/_components/custom-field-cell.tsx`
- Modify: `apps/nextjs/app/(protected)/organization/_components/tableau-board.tsx`

**Step 1: Create AddColumnPopover**

When clicking the "+" button at the right of the table:
- Popover opens with column name input + type selector (text/number/checkbox/date/select)
- On submit → calls `updateTableau.mutate({ columns: [...existing, newColumn] })`
- Generates a unique column id: `col_${crypto.randomUUID().slice(0, 8)}`

**Step 2: Create CustomFieldCell**

Renders the right input based on column type:
- `text`: EditableText
- `number`: EditableText with type="number"
- `checkbox`: Checkbox (shadcn)
- `date`: DatePickerCell
- `select`: Select with column.options

On change → calls `updateRow.mutate({ rowId, customFields: { [columnId]: value } })`

**Step 3: Wire into TableauBoard**

- After the fixed columns (Fichiers), render one `<TableHead>` + `<TableCell>` per `tableau.columns`
- Each column header is an EditableText (rename on click)
- Each column header has a delete button (trash icon)
- The "+" button at the right opens AddColumnPopover
- `colSpan` on the "add row" row and empty state row must be updated dynamically: `6 + tableau.columns.length`

**Step 4: Commit**

```bash
git add apps/nextjs/app/(protected)/organization/_components/add-column-popover.tsx apps/nextjs/app/(protected)/organization/_components/custom-field-cell.tsx apps/nextjs/app/(protected)/organization/_components/tableau-board.tsx
git commit -m "feat(ui): dynamic custom columns with add/edit/delete"
```

---

## Task 10: Repository & Mapper Persistence

**Files:**
- Modify: `apps/nextjs/src/adapters/mappers/tableau.mapper.ts`
- Modify: `apps/nextjs/src/adapters/repositories/tableau.repository.ts`

**Step 1: Update tableauToPersistence**

Add `statusOptions`, `priorityOptions`, `columns` to the tableau record. Add `customFields` to row records.

**Step 2: Update tableauToDomain**

Read `statusOptions`, `priorityOptions`, `columns` from `tableauRecord`. Fall back to defaults if null (for existing data). Read `customFields` from each `rowRecord`.

**Step 3: Update repository**

In `update()`: persist the new tableau-level JSONB fields in the `SET` clause.

```typescript
await database
  .update(tableauTable)
  .set({
    title: data.tableau.title,
    statusOptions: data.tableau.statusOptions,
    priorityOptions: data.tableau.priorityOptions,
    columns: data.tableau.columns,
    updatedAt: data.tableau.updatedAt ?? new Date(),
  })
  .where(eq(tableauTable.id, tableauId));
```

**Step 4: Commit**

```bash
git add apps/nextjs/src/adapters/mappers/tableau.mapper.ts apps/nextjs/src/adapters/repositories/tableau.repository.ts
git commit -m "feat(persistence): persist custom columns and options"
```

---

## Task 11: Quality Checks

**Step 1: Run type check**

Run: `pnpm type-check`

**Step 2: Run lint/format**

Run: `pnpm fix`

**Step 3: Run tests**

Run: `pnpm test`

Fix any failures — most likely in existing tableau tests that reference the old RowStatus/RowPriority enum validation.

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix: resolve type/lint issues after tableau interactif feature"
```
