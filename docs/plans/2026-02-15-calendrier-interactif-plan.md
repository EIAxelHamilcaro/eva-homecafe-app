# Calendrier Interactif + Google Calendar — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transformer le calendrier read-only de la page Organisation en un calendrier interactif avec CRUD d'événements locaux, auth Google (login + Calendar R/W), et modale tuto.

**Architecture:** Nouveau domaine `CalendarEvent` (DDD léger — Entity + Repo + UseCases, pas d'event dispatch). Auth Google via BetterAuth `socialProviders`. Google Calendar API côté serveur via access token stocké en DB. Frontend : React Query hooks + dialogs shadcn/ui.

**Tech Stack:** BetterAuth (Google OAuth), Google Calendar API v3, Drizzle ORM, React Query, shadcn/ui Dialog, Zod

**Reference files:** Suivre le pattern du domaine `Tableau` pour toute la stack (domain → use case → controller → repo → hooks).

---

## Task 1: Schema DB — table `calendar_event`

**Files:**
- Create: `packages/drizzle/src/schema/calendar-event.ts`
- Modify: `packages/drizzle/src/schema/index.ts`

**Step 1: Create the schema file**

```typescript
// packages/drizzle/src/schema/calendar-event.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const calendarEvent = pgTable("calendar_event", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  color: text("color").notNull(),
  date: text("date").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});
```

**Step 2: Export from schema index**

Add `export * from "./calendar-event";` in `packages/drizzle/src/schema/index.ts` (alphabetical order, after `./board`).

**Step 3: Push schema to DB**

Run: `pnpm db:push`
Expected: Table `calendar_event` created successfully.

**Step 4: Commit**

```bash
git add packages/drizzle/src/schema/calendar-event.ts packages/drizzle/src/schema/index.ts
git commit -m "feat(calendar): add calendar_event DB schema"
```

---

## Task 2: Domain — CalendarEvent aggregate + value objects

**Files:**
- Create: `apps/nextjs/src/domain/calendar-event/calendar-event.aggregate.ts`
- Create: `apps/nextjs/src/domain/calendar-event/calendar-event-id.ts`
- Create: `apps/nextjs/src/domain/calendar-event/value-objects/event-title.vo.ts`
- Create: `apps/nextjs/src/domain/calendar-event/value-objects/event-color.vo.ts`

**Step 1: Create CalendarEventId**

```typescript
// apps/nextjs/src/domain/calendar-event/calendar-event-id.ts
import { UUID } from "@packages/ddd-kit";

export class CalendarEventId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "CalendarEventId";
  static create(id: UUID<string | number>): CalendarEventId {
    return new CalendarEventId(id.value);
  }
}
```

**Step 2: Create EventTitle VO**

```typescript
// apps/nextjs/src/domain/calendar-event/value-objects/event-title.vo.ts
import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z.string().min(1, "Le titre est requis").max(100, "Le titre ne peut pas dépasser 100 caractères");

export class EventTitle extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      return Result.fail(result.error.errors[0].message);
    }
    return Result.ok(result.data);
  }
}
```

**Step 3: Create EventColor VO**

```typescript
// apps/nextjs/src/domain/calendar-event/value-objects/event-color.vo.ts
import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const EVENT_COLORS = [
  "pink",
  "green",
  "orange",
  "blue",
  "purple",
  "amber",
  "red",
  "teal",
] as const;

export type EventColorValue = (typeof EVENT_COLORS)[number];

const schema = z.enum(EVENT_COLORS);

export class EventColor extends ValueObject<EventColorValue> {
  protected validate(value: EventColorValue): Result<EventColorValue> {
    const result = schema.safeParse(value);
    if (!result.success) {
      return Result.fail(result.error.errors[0].message);
    }
    return Result.ok(result.data);
  }
}
```

**Step 4: Create CalendarEvent aggregate**

```typescript
// apps/nextjs/src/domain/calendar-event/calendar-event.aggregate.ts
import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { CalendarEventId } from "./calendar-event-id";
import type { EventColor } from "./value-objects/event-color.vo";
import type { EventTitle } from "./value-objects/event-title.vo";

export interface ICalendarEventProps {
  userId: string;
  title: EventTitle;
  color: EventColor;
  date: string;
  createdAt: Date;
  updatedAt: Option<Date>;
}

export class CalendarEvent extends Aggregate<ICalendarEventProps> {
  private constructor(props: ICalendarEventProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): CalendarEventId {
    return CalendarEventId.create(this._id);
  }

  updateTitle(title: EventTitle): void {
    this._props.title = title;
    this._props.updatedAt = Option.some(new Date());
  }

  updateColor(color: EventColor): void {
    this._props.color = color;
    this._props.updatedAt = Option.some(new Date());
  }

  updateDate(date: string): void {
    this._props.date = date;
    this._props.updatedAt = Option.some(new Date());
  }

  static create(
    props: { userId: string; title: EventTitle; color: EventColor; date: string },
    id?: UUID<string | number>,
  ): CalendarEvent {
    return new CalendarEvent(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: Option.none(),
      },
      id ?? new UUID(),
    );
  }

  static reconstitute(props: ICalendarEventProps, id: CalendarEventId): CalendarEvent {
    return new CalendarEvent(props, id);
  }
}
```

**Step 5: Run format**

Run: `pnpm fix`

**Step 6: Commit**

```bash
git add apps/nextjs/src/domain/calendar-event/
git commit -m "feat(calendar): add CalendarEvent domain (aggregate, VOs)"
```

---

## Task 3: Application — Port, DTOs, Use Cases

**Files:**
- Create: `apps/nextjs/src/application/ports/calendar-event-repository.port.ts`
- Create: `apps/nextjs/src/application/dto/calendar-event/common-calendar-event.dto.ts`
- Create: `apps/nextjs/src/application/dto/calendar-event/create-calendar-event.dto.ts`
- Create: `apps/nextjs/src/application/dto/calendar-event/update-calendar-event.dto.ts`
- Create: `apps/nextjs/src/application/dto/calendar-event/delete-calendar-event.dto.ts`
- Create: `apps/nextjs/src/application/dto/calendar-event/get-calendar-events.dto.ts`
- Create: `apps/nextjs/src/application/use-cases/calendar-event/create-calendar-event.use-case.ts`
- Create: `apps/nextjs/src/application/use-cases/calendar-event/update-calendar-event.use-case.ts`
- Create: `apps/nextjs/src/application/use-cases/calendar-event/delete-calendar-event.use-case.ts`
- Create: `apps/nextjs/src/application/use-cases/calendar-event/get-user-calendar-events.use-case.ts`

**Step 1: Create port**

```typescript
// apps/nextjs/src/application/ports/calendar-event-repository.port.ts
import type { BaseRepository, PaginatedResult, PaginationParams, Result } from "@packages/ddd-kit";
import type { CalendarEvent } from "@/domain/calendar-event/calendar-event.aggregate";

export interface ICalendarEventRepository extends BaseRepository<CalendarEvent> {
  findByUserIdAndMonth(
    userId: string,
    month: string,
  ): Promise<Result<CalendarEvent[]>>;
}
```

**Step 2: Create DTOs**

`common-calendar-event.dto.ts`:
```typescript
import { z } from "zod";
import { EVENT_COLORS } from "@/domain/calendar-event/value-objects/event-color.vo";

export const calendarEventDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  color: z.enum(EVENT_COLORS),
  date: z.string(),
  userId: z.string(),
  createdAt: z.string(),
});

export type ICalendarEventDto = z.infer<typeof calendarEventDtoSchema>;
```

`create-calendar-event.dto.ts`:
```typescript
import { z } from "zod";
import { EVENT_COLORS } from "@/domain/calendar-event/value-objects/event-color.vo";

export const createCalendarEventInputDtoSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(100),
  color: z.enum(EVENT_COLORS),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ICreateCalendarEventInputDto = z.infer<typeof createCalendarEventInputDtoSchema>;
export type ICreateCalendarEventOutputDto = ICalendarEventDto;

import type { ICalendarEventDto } from "./common-calendar-event.dto";
```

`update-calendar-event.dto.ts`:
```typescript
import { z } from "zod";
import { EVENT_COLORS } from "@/domain/calendar-event/value-objects/event-color.vo";

export const updateCalendarEventInputDtoSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
  title: z.string().min(1).max(100).optional(),
  color: z.enum(EVENT_COLORS).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type IUpdateCalendarEventInputDto = z.infer<typeof updateCalendarEventInputDtoSchema>;
export type IUpdateCalendarEventOutputDto = ICalendarEventDto;

import type { ICalendarEventDto } from "./common-calendar-event.dto";
```

`delete-calendar-event.dto.ts`:
```typescript
import { z } from "zod";

export const deleteCalendarEventInputDtoSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
});

export type IDeleteCalendarEventInputDto = z.infer<typeof deleteCalendarEventInputDtoSchema>;
export type IDeleteCalendarEventOutputDto = { deleted: true };
```

`get-calendar-events.dto.ts`:
```typescript
import { z } from "zod";
import type { ICalendarEventDto } from "./common-calendar-event.dto";

export const getCalendarEventsInputDtoSchema = z.object({
  userId: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export type IGetCalendarEventsInputDto = z.infer<typeof getCalendarEventsInputDtoSchema>;
export type IGetCalendarEventsOutputDto = { events: ICalendarEventDto[] };
```

**Step 3: Create use cases**

`create-calendar-event.use-case.ts`:
```typescript
import { Result, type UseCase } from "@packages/ddd-kit";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";
import { CalendarEvent } from "@/domain/calendar-event/calendar-event.aggregate";
import { EventColor } from "@/domain/calendar-event/value-objects/event-color.vo";
import { EventTitle } from "@/domain/calendar-event/value-objects/event-title.vo";
import type { ICreateCalendarEventInputDto, ICreateCalendarEventOutputDto } from "@/application/dto/calendar-event/create-calendar-event.dto";
import { calendarEventToDto } from "@/application/dto/calendar-event/common-calendar-event.dto";

export class CreateCalendarEventUseCase
  implements UseCase<ICreateCalendarEventInputDto, ICreateCalendarEventOutputDto>
{
  constructor(private readonly repo: ICalendarEventRepository) {}

  async execute(input: ICreateCalendarEventInputDto): Promise<Result<ICreateCalendarEventOutputDto>> {
    const titleResult = EventTitle.create(input.title);
    if (titleResult.isFailure) return Result.fail(titleResult.getError());

    const colorResult = EventColor.create(input.color);
    if (colorResult.isFailure) return Result.fail(colorResult.getError());

    const event = CalendarEvent.create({
      userId: input.userId,
      title: titleResult.getValue(),
      color: colorResult.getValue(),
      date: input.date,
    });

    const saveResult = await this.repo.create(event);
    if (saveResult.isFailure) return Result.fail(saveResult.getError());

    return Result.ok(calendarEventToDto(event));
  }
}
```

`update-calendar-event.use-case.ts`:
```typescript
import { Result, type UseCase, match } from "@packages/ddd-kit";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";
import { CalendarEventId } from "@/domain/calendar-event/calendar-event-id";
import { EventColor } from "@/domain/calendar-event/value-objects/event-color.vo";
import { EventTitle } from "@/domain/calendar-event/value-objects/event-title.vo";
import type { IUpdateCalendarEventInputDto, IUpdateCalendarEventOutputDto } from "@/application/dto/calendar-event/update-calendar-event.dto";
import { calendarEventToDto } from "@/application/dto/calendar-event/common-calendar-event.dto";
import { UUID } from "@packages/ddd-kit";

export class UpdateCalendarEventUseCase
  implements UseCase<IUpdateCalendarEventInputDto, IUpdateCalendarEventOutputDto>
{
  constructor(private readonly repo: ICalendarEventRepository) {}

  async execute(input: IUpdateCalendarEventInputDto): Promise<Result<IUpdateCalendarEventOutputDto>> {
    const id = CalendarEventId.create(new UUID(input.eventId));
    const findResult = await this.repo.findById(id);
    if (findResult.isFailure) return Result.fail(findResult.getError());

    const event = match(findResult.getValue(), {
      Some: (e) => e,
      None: () => null,
    });
    if (!event) return Result.fail("Event not found");
    if (event.get("userId") !== input.userId) return Result.fail("Forbidden");

    if (input.title !== undefined) {
      const titleResult = EventTitle.create(input.title);
      if (titleResult.isFailure) return Result.fail(titleResult.getError());
      event.updateTitle(titleResult.getValue());
    }

    if (input.color !== undefined) {
      const colorResult = EventColor.create(input.color);
      if (colorResult.isFailure) return Result.fail(colorResult.getError());
      event.updateColor(colorResult.getValue());
    }

    if (input.date !== undefined) {
      event.updateDate(input.date);
    }

    const updateResult = await this.repo.update(event);
    if (updateResult.isFailure) return Result.fail(updateResult.getError());

    return Result.ok(calendarEventToDto(event));
  }
}
```

`delete-calendar-event.use-case.ts`:
```typescript
import { Result, UUID, type UseCase, match } from "@packages/ddd-kit";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";
import { CalendarEventId } from "@/domain/calendar-event/calendar-event-id";
import type { IDeleteCalendarEventInputDto, IDeleteCalendarEventOutputDto } from "@/application/dto/calendar-event/delete-calendar-event.dto";

export class DeleteCalendarEventUseCase
  implements UseCase<IDeleteCalendarEventInputDto, IDeleteCalendarEventOutputDto>
{
  constructor(private readonly repo: ICalendarEventRepository) {}

  async execute(input: IDeleteCalendarEventInputDto): Promise<Result<IDeleteCalendarEventOutputDto>> {
    const id = CalendarEventId.create(new UUID(input.eventId));
    const findResult = await this.repo.findById(id);
    if (findResult.isFailure) return Result.fail(findResult.getError());

    const event = match(findResult.getValue(), {
      Some: (e) => e,
      None: () => null,
    });
    if (!event) return Result.fail("Event not found");
    if (event.get("userId") !== input.userId) return Result.fail("Forbidden");

    const deleteResult = await this.repo.delete(id);
    if (deleteResult.isFailure) return Result.fail(deleteResult.getError());

    return Result.ok({ deleted: true });
  }
}
```

`get-user-calendar-events.use-case.ts`:
```typescript
import { Result, type UseCase } from "@packages/ddd-kit";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";
import type { IGetCalendarEventsInputDto, IGetCalendarEventsOutputDto } from "@/application/dto/calendar-event/get-calendar-events.dto";
import { calendarEventToDto } from "@/application/dto/calendar-event/common-calendar-event.dto";

export class GetUserCalendarEventsUseCase
  implements UseCase<IGetCalendarEventsInputDto, IGetCalendarEventsOutputDto>
{
  constructor(private readonly repo: ICalendarEventRepository) {}

  async execute(input: IGetCalendarEventsInputDto): Promise<Result<IGetCalendarEventsOutputDto>> {
    const result = await this.repo.findByUserIdAndMonth(input.userId, input.month);
    if (result.isFailure) return Result.fail(result.getError());

    return Result.ok({
      events: result.getValue().map(calendarEventToDto),
    });
  }
}
```

**Step 4: Add `calendarEventToDto` helper to common DTO**

Update `common-calendar-event.dto.ts` to include:
```typescript
import type { CalendarEvent } from "@/domain/calendar-event/calendar-event.aggregate";

export function calendarEventToDto(event: CalendarEvent): ICalendarEventDto {
  return {
    id: event.id.value.toString(),
    title: event.get("title").value,
    color: event.get("color").value,
    date: event.get("date"),
    userId: event.get("userId"),
    createdAt: event.get("createdAt").toISOString(),
  };
}
```

**Step 5: Run format + type-check**

Run: `pnpm fix && pnpm type-check`

**Step 6: Commit**

```bash
git add apps/nextjs/src/application/ports/calendar-event-repository.port.ts apps/nextjs/src/application/dto/calendar-event/ apps/nextjs/src/application/use-cases/calendar-event/
git commit -m "feat(calendar): add use cases, DTOs, and port for CalendarEvent"
```

---

## Task 4: Adapters — Mapper, Repository, Controller, DI

**Files:**
- Create: `apps/nextjs/src/adapters/mappers/calendar-event.mapper.ts`
- Create: `apps/nextjs/src/adapters/repositories/calendar-event.repository.ts`
- Create: `apps/nextjs/src/adapters/controllers/calendar-event/calendar-event.controller.ts`
- Create: `apps/nextjs/common/di/modules/calendar-event.module.ts`
- Modify: `apps/nextjs/common/di/types.ts` — add DI symbols
- Modify: `apps/nextjs/common/di/container.ts` — load module

**Step 1: Mapper**

```typescript
// apps/nextjs/src/adapters/mappers/calendar-event.mapper.ts
import { Option, Result, UUID } from "@packages/ddd-kit";
import type { calendarEvent as calendarEventTable } from "@packages/drizzle/schema";
import { CalendarEvent } from "@/domain/calendar-event/calendar-event.aggregate";
import { CalendarEventId } from "@/domain/calendar-event/calendar-event-id";
import { EventColor } from "@/domain/calendar-event/value-objects/event-color.vo";
import type { EventColorValue } from "@/domain/calendar-event/value-objects/event-color.vo";
import { EventTitle } from "@/domain/calendar-event/value-objects/event-title.vo";

type CalendarEventRecord = typeof calendarEventTable.$inferSelect;

export function calendarEventToDomain(record: CalendarEventRecord): Result<CalendarEvent> {
  const titleResult = EventTitle.create(record.title);
  if (titleResult.isFailure) return Result.fail(titleResult.getError());

  const colorResult = EventColor.create(record.color as EventColorValue);
  if (colorResult.isFailure) return Result.fail(colorResult.getError());

  return Result.ok(
    CalendarEvent.reconstitute(
      {
        userId: record.userId,
        title: titleResult.getValue(),
        color: colorResult.getValue(),
        date: record.date,
        createdAt: record.createdAt,
        updatedAt: Option.fromNullable(record.updatedAt),
      },
      CalendarEventId.create(new UUID(record.id)),
    ),
  );
}

export function calendarEventToPersistence(event: CalendarEvent) {
  const updatedAt = event.get("updatedAt");
  return {
    id: event.id.value.toString(),
    title: event.get("title").value,
    color: event.get("color").value,
    date: event.get("date"),
    userId: event.get("userId"),
    createdAt: event.get("createdAt"),
    updatedAt: updatedAt.isSome() ? updatedAt.unwrap() : null,
  };
}
```

**Step 2: Repository** — follow `DrizzleTableauRepository` pattern but simpler (no child entities).

```typescript
// apps/nextjs/src/adapters/repositories/calendar-event.repository.ts
import { Option, Result, createPaginatedResult, DEFAULT_PAGINATION, type PaginatedResult, type PaginationParams } from "@packages/ddd-kit";
import { db, eq, and, gte, lt, type Transaction, type DbClient, count as sqlCount, asc } from "@packages/drizzle";
import { calendarEvent as calendarEventTable } from "@packages/drizzle/schema";
import { calendarEventToDomain, calendarEventToPersistence } from "@/adapters/mappers/calendar-event.mapper";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";
import type { CalendarEvent } from "@/domain/calendar-event/calendar-event.aggregate";
import type { CalendarEventId } from "@/domain/calendar-event/calendar-event-id";

export class DrizzleCalendarEventRepository implements ICalendarEventRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(entity: CalendarEvent, trx?: Transaction): Promise<Result<CalendarEvent>> {
    try {
      const data = calendarEventToPersistence(entity);
      await this.getDb(trx).insert(calendarEventTable).values(data);
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create calendar event: ${error}`);
    }
  }

  async update(entity: CalendarEvent, trx?: Transaction): Promise<Result<CalendarEvent>> {
    try {
      const data = calendarEventToPersistence(entity);
      await this.getDb(trx)
        .update(calendarEventTable)
        .set({
          title: data.title,
          color: data.color,
          date: data.date,
          updatedAt: data.updatedAt ?? new Date(),
        })
        .where(eq(calendarEventTable.id, data.id));
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update calendar event: ${error}`);
    }
  }

  async delete(id: CalendarEventId, trx?: Transaction): Promise<Result<CalendarEventId>> {
    try {
      await this.getDb(trx)
        .delete(calendarEventTable)
        .where(eq(calendarEventTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete calendar event: ${error}`);
    }
  }

  async findById(id: CalendarEventId): Promise<Result<Option<CalendarEvent>>> {
    try {
      const records = await db
        .select()
        .from(calendarEventTable)
        .where(eq(calendarEventTable.id, String(id.value)))
        .limit(1);

      const record = records[0];
      if (!record) return Result.ok(Option.none());

      const domainResult = calendarEventToDomain(record);
      if (domainResult.isFailure) return Result.fail(domainResult.getError());
      return Result.ok(Option.some(domainResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find calendar event: ${error}`);
    }
  }

  async findByUserIdAndMonth(userId: string, month: string): Promise<Result<CalendarEvent[]>> {
    try {
      const [year, m] = month.split("-").map(Number);
      const startDate = `${year}-${String(m).padStart(2, "0")}-01`;
      const nextMonth = m === 12 ? `${year + 1}-01-01` : `${year}-${String(m + 1).padStart(2, "0")}-01`;

      const records = await db
        .select()
        .from(calendarEventTable)
        .where(
          and(
            eq(calendarEventTable.userId, userId),
            gte(calendarEventTable.date, startDate),
            lt(calendarEventTable.date, nextMonth),
          ),
        )
        .orderBy(asc(calendarEventTable.date));

      const events: CalendarEvent[] = [];
      for (const record of records) {
        const domainResult = calendarEventToDomain(record);
        if (domainResult.isFailure) return Result.fail(domainResult.getError());
        events.push(domainResult.getValue());
      }

      return Result.ok(events);
    } catch (error) {
      return Result.fail(`Failed to find calendar events: ${error}`);
    }
  }

  async findAll(pagination: PaginationParams = DEFAULT_PAGINATION): Promise<Result<PaginatedResult<CalendarEvent>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;
      const [records, countResult] = await Promise.all([
        db.select().from(calendarEventTable).orderBy(asc(calendarEventTable.date)).limit(pagination.limit).offset(offset),
        this.count(),
      ]);
      if (countResult.isFailure) return Result.fail(countResult.getError());

      const events: CalendarEvent[] = [];
      for (const record of records) {
        const r = calendarEventToDomain(record);
        if (r.isFailure) return Result.fail(r.getError());
        events.push(r.getValue());
      }
      return Result.ok(createPaginatedResult(events, pagination, countResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find all calendar events: ${error}`);
    }
  }

  async findMany(props: Partial<CalendarEvent["_props"]>, pagination: PaginationParams = DEFAULT_PAGINATION): Promise<Result<PaginatedResult<CalendarEvent>>> {
    return this.findAll(pagination);
  }

  async findBy(props: Partial<CalendarEvent["_props"]>): Promise<Result<Option<CalendarEvent>>> {
    return Result.ok(Option.none());
  }

  async exists(id: CalendarEventId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: calendarEventTable.id })
        .from(calendarEventTable)
        .where(eq(calendarEventTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check calendar event existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const [result] = await db.select({ value: sqlCount() }).from(calendarEventTable);
      return Result.ok(result?.value ?? 0);
    } catch (error) {
      return Result.fail(`Failed to count calendar events: ${error}`);
    }
  }
}
```

**Step 3: Controller**

```typescript
// apps/nextjs/src/adapters/controllers/calendar-event/calendar-event.controller.ts
import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { createCalendarEventInputDtoSchema } from "@/application/dto/calendar-event/create-calendar-event.dto";
import { updateCalendarEventInputDtoSchema } from "@/application/dto/calendar-event/update-calendar-event.dto";
import { deleteCalendarEventInputDtoSchema } from "@/application/dto/calendar-event/delete-calendar-event.dto";
import { getCalendarEventsInputDtoSchema } from "@/application/dto/calendar-event/get-calendar-events.dto";
import { getInjection } from "@/common/di/container";

async function getAuthenticatedUser(request: Request): Promise<IGetSessionOutputDto | null> {
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(request.headers);
  if (result.isFailure) return null;
  return match<IGetSessionOutputDto, IGetSessionOutputDto | null>(result.getValue(), {
    Some: (session) => session,
    None: () => null,
  });
}

export async function getCalendarEventsController(request: Request) {
  const session = await getAuthenticatedUser(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const month = url.searchParams.get("month");

  const parsed = getCalendarEventsInputDtoSchema.safeParse({
    userId: session.user.id,
    month,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const useCase = getInjection("GetUserCalendarEventsUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) return NextResponse.json({ error: result.getError() }, { status: 500 });
  return NextResponse.json(result.getValue());
}

export async function createCalendarEventController(request: Request) {
  const session = await getAuthenticatedUser(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try { json = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const parsed = createCalendarEventInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const useCase = getInjection("CreateCalendarEventUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) return NextResponse.json({ error: result.getError() }, { status: 500 });
  return NextResponse.json(result.getValue(), { status: 201 });
}

export async function updateCalendarEventController(request: Request, eventId: string) {
  const session = await getAuthenticatedUser(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try { json = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const parsed = updateCalendarEventInputDtoSchema.safeParse({
    ...(json as Record<string, unknown>),
    eventId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const useCase = getInjection("UpdateCalendarEventUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") return NextResponse.json({ error }, { status: 403 });
    if (error === "Event not found") return NextResponse.json({ error }, { status: 404 });
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(result.getValue());
}

export async function deleteCalendarEventController(request: Request, eventId: string) {
  const session = await getAuthenticatedUser(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = deleteCalendarEventInputDtoSchema.safeParse({
    eventId,
    userId: session.user.id,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const useCase = getInjection("DeleteCalendarEventUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Forbidden") return NextResponse.json({ error }, { status: 403 });
    if (error === "Event not found") return NextResponse.json({ error }, { status: 404 });
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json(result.getValue());
}
```

**Step 4: DI module**

```typescript
// apps/nextjs/common/di/modules/calendar-event.module.ts
import { createModule } from "@evyweb/ioctopus";
import { DrizzleCalendarEventRepository } from "@/adapters/repositories/calendar-event.repository";
import { CreateCalendarEventUseCase } from "@/application/use-cases/calendar-event/create-calendar-event.use-case";
import { DeleteCalendarEventUseCase } from "@/application/use-cases/calendar-event/delete-calendar-event.use-case";
import { GetUserCalendarEventsUseCase } from "@/application/use-cases/calendar-event/get-user-calendar-events.use-case";
import { UpdateCalendarEventUseCase } from "@/application/use-cases/calendar-event/update-calendar-event.use-case";
import { DI_SYMBOLS } from "../types";

export const createCalendarEventModule = () => {
  const m = createModule();

  m.bind(DI_SYMBOLS.ICalendarEventRepository).toClass(DrizzleCalendarEventRepository);

  m.bind(DI_SYMBOLS.CreateCalendarEventUseCase).toClass(CreateCalendarEventUseCase, [DI_SYMBOLS.ICalendarEventRepository]);
  m.bind(DI_SYMBOLS.DeleteCalendarEventUseCase).toClass(DeleteCalendarEventUseCase, [DI_SYMBOLS.ICalendarEventRepository]);
  m.bind(DI_SYMBOLS.GetUserCalendarEventsUseCase).toClass(GetUserCalendarEventsUseCase, [DI_SYMBOLS.ICalendarEventRepository]);
  m.bind(DI_SYMBOLS.UpdateCalendarEventUseCase).toClass(UpdateCalendarEventUseCase, [DI_SYMBOLS.ICalendarEventRepository]);

  return m;
};
```

**Step 5: Update `types.ts`** — add imports and DI_SYMBOLS + DI_RETURN_TYPES entries for:
- `ICalendarEventRepository`
- `CreateCalendarEventUseCase`
- `UpdateCalendarEventUseCase`
- `DeleteCalendarEventUseCase`
- `GetUserCalendarEventsUseCase`

**Step 6: Update `container.ts`** — add `createCalendarEventModule` import and load (alphabetical: after Board, before Chat).

**Step 7: Run format + type-check**

Run: `pnpm fix && pnpm type-check`

**Step 8: Commit**

```bash
git add apps/nextjs/src/adapters/mappers/calendar-event.mapper.ts apps/nextjs/src/adapters/repositories/calendar-event.repository.ts apps/nextjs/src/adapters/controllers/calendar-event/ apps/nextjs/common/di/
git commit -m "feat(calendar): add mapper, repository, controller, and DI for CalendarEvent"
```

---

## Task 5: API Routes

**Files:**
- Create: `apps/nextjs/app/api/v1/calendar-events/route.ts`
- Create: `apps/nextjs/app/api/v1/calendar-events/[eventId]/route.ts`

**Step 1: Collection route (GET + POST)**

```typescript
// apps/nextjs/app/api/v1/calendar-events/route.ts
import { getCalendarEventsController, createCalendarEventController } from "@/adapters/controllers/calendar-event/calendar-event.controller";

export const GET = getCalendarEventsController;
export const POST = createCalendarEventController;
```

**Step 2: Item route (PUT + DELETE)**

```typescript
// apps/nextjs/app/api/v1/calendar-events/[eventId]/route.ts
import { updateCalendarEventController, deleteCalendarEventController } from "@/adapters/controllers/calendar-event/calendar-event.controller";

export async function PUT(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return updateCalendarEventController(request, eventId);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return deleteCalendarEventController(request, eventId);
}
```

**Step 3: Commit**

```bash
git add apps/nextjs/app/api/v1/calendar-events/
git commit -m "feat(calendar): add API routes for calendar events"
```

---

## Task 6: Tests — Use Cases

**Files:**
- Create: `apps/nextjs/src/application/use-cases/calendar-event/__tests__/create-calendar-event.use-case.test.ts`
- Create: `apps/nextjs/src/application/use-cases/calendar-event/__tests__/update-calendar-event.use-case.test.ts`
- Create: `apps/nextjs/src/application/use-cases/calendar-event/__tests__/delete-calendar-event.use-case.test.ts`

**Step 1: Write create test**

```typescript
// create-calendar-event.use-case.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Result, Option } from "@packages/ddd-kit";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";
import { CreateCalendarEventUseCase } from "../create-calendar-event.use-case";

describe("CreateCalendarEventUseCase", () => {
  let useCase: CreateCalendarEventUseCase;
  let mockRepo: ICalendarEventRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = {
      create: vi.fn().mockImplementation((entity) => Promise.resolve(Result.ok(entity))),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserIdAndMonth: vi.fn(),
    } as unknown as ICalendarEventRepository;
    useCase = new CreateCalendarEventUseCase(mockRepo);
  });

  it("should create a calendar event with valid input", async () => {
    const result = await useCase.execute({
      userId: "user-1",
      title: "Rendez-vous dentiste",
      color: "blue",
      date: "2026-03-15",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().title).toBe("Rendez-vous dentiste");
    expect(result.getValue().color).toBe("blue");
    expect(result.getValue().date).toBe("2026-03-15");
    expect(mockRepo.create).toHaveBeenCalledOnce();
  });

  it("should fail when title is empty", async () => {
    const result = await useCase.execute({
      userId: "user-1",
      title: "",
      color: "blue",
      date: "2026-03-15",
    });

    expect(result.isFailure).toBe(true);
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("should fail when repository returns error", async () => {
    (mockRepo.create as ReturnType<typeof vi.fn>).mockResolvedValue(Result.fail("DB error"));

    const result = await useCase.execute({
      userId: "user-1",
      title: "Test",
      color: "pink",
      date: "2026-03-15",
    });

    expect(result.isFailure).toBe(true);
  });
});
```

**Step 2: Write update + delete tests** (similar pattern, test happy path, not found, forbidden, repo error).

**Step 3: Run tests**

Run: `pnpm test -- --run apps/nextjs/src/application/use-cases/calendar-event/`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add apps/nextjs/src/application/use-cases/calendar-event/__tests__/
git commit -m "test(calendar): add use case tests for CalendarEvent CRUD"
```

---

## Task 7: BetterAuth — Google OAuth provider

**Files:**
- Modify: `apps/nextjs/common/auth.ts` — add Google social provider
- Create: `apps/nextjs/common/auth-client.ts` — client-side auth
- Modify: `apps/nextjs/app/(auth)/login/_components/login-form.tsx` — add Google button
- Modify: `apps/nextjs/app/(auth)/register/_components/register-form.tsx` — add Google button

**Step 1: Update `auth.ts`**

Add `socialProviders` to the BetterAuth config:

```typescript
socialProviders: {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    accessType: "offline",
    prompt: "consent",
    scopes: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  },
},
```

**Step 2: Create auth client**

```typescript
// apps/nextjs/common/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});
```

**Step 3: Add Google sign-in button to LoginForm**

After the existing submit button area, add a divider + Google button:

```tsx
<div className="flex items-center gap-4 pt-2">
  <div className="h-px flex-1 bg-homecafe-grey" />
  <span className="text-xs text-muted-foreground">ou</span>
  <div className="h-px flex-1 bg-homecafe-grey" />
</div>

<Button
  type="button"
  variant="outline"
  className="w-full rounded-full py-2.5"
  onClick={handleGoogleSignIn}
  disabled={submitting}
>
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
  Continuer avec Google
</Button>
```

The `handleGoogleSignIn` function:
```typescript
async function handleGoogleSignIn() {
  setSubmitting(true);
  try {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  } catch {
    setServerError("Impossible de se connecter avec Google.");
  } finally {
    setSubmitting(false);
  }
}
```

Import `authClient` at the top: `import { authClient } from "@/common/auth-client";`

**Step 4: Same for RegisterForm** — add the same Google button + divider below the submit button.

**Step 5: Add env vars to `.env.example`**

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 6: Run format**

Run: `pnpm fix`

**Step 7: Commit**

```bash
git add apps/nextjs/common/auth.ts apps/nextjs/common/auth-client.ts apps/nextjs/app/(auth)/login/ apps/nextjs/app/(auth)/register/
git commit -m "feat(auth): add Google OAuth login/signup with BetterAuth"
```

---

## Task 8: Google Calendar API — Server-side routes

**Files:**
- Create: `apps/nextjs/app/api/v1/google-calendar/events/route.ts`

**Step 1: Create Google Calendar API route**

```typescript
// apps/nextjs/app/api/v1/google-calendar/events/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/common/auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const month = url.searchParams.get("month");
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Invalid month parameter" }, { status: 400 });
  }

  try {
    const tokenResult = await auth.api.getAccessToken({
      body: { providerId: "google" },
      headers: request.headers,
    });

    if (!tokenResult?.accessToken) {
      return NextResponse.json({ events: [], connected: false });
    }

    const [year, m] = month.split("-").map(Number);
    const timeMin = new Date(year, m - 1, 1).toISOString();
    const timeMax = new Date(year, m, 0, 23, 59, 59).toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      { headers: { Authorization: `Bearer ${tokenResult.accessToken}` } },
    );

    if (!response.ok) {
      return NextResponse.json({ events: [], connected: true, error: "Failed to fetch Google events" });
    }

    const data = await response.json();
    const events = (data.items ?? []).map((item: any) => ({
      id: item.id,
      title: item.summary ?? "(Sans titre)",
      date: item.start?.date ?? item.start?.dateTime?.split("T")[0] ?? "",
      color: "blue",
      source: "google" as const,
    }));

    return NextResponse.json({ events, connected: true });
  } catch {
    return NextResponse.json({ events: [], connected: false });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tokenResult = await auth.api.getAccessToken({
      body: { providerId: "google" },
      headers: request.headers,
    });

    if (!tokenResult?.accessToken) {
      return NextResponse.json({ error: "Google account not connected" }, { status: 400 });
    }

    const body = await request.json();
    const { title, date } = body;

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResult.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: title,
          start: { date },
          end: { date },
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to create Google event" }, { status: 500 });
    }

    const created = await response.json();
    return NextResponse.json({ id: created.id, title: created.summary, date }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create Google event" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add apps/nextjs/app/api/v1/google-calendar/
git commit -m "feat(calendar): add Google Calendar API routes (read + write)"
```

---

## Task 9: React Query hooks

**Files:**
- Create: `apps/nextjs/app/(protected)/_hooks/use-calendar-events.ts`

**Step 1: Create hooks**

```typescript
// apps/nextjs/app/(protected)/_hooks/use-calendar-events.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ICalendarEventDto } from "@/application/dto/calendar-event/common-calendar-event.dto";
import type { IGetCalendarEventsOutputDto } from "@/application/dto/calendar-event/get-calendar-events.dto";
import { apiFetch } from "@/common/api";

export const calendarEventKeys = {
  all: ["calendar-events"] as const,
  month: (month: string) => ["calendar-events", month] as const,
  google: (month: string) => ["google-calendar", month] as const,
};

export function useCalendarEventsQuery(month: string) {
  return useQuery<IGetCalendarEventsOutputDto>({
    queryKey: calendarEventKeys.month(month),
    queryFn: () => apiFetch<IGetCalendarEventsOutputDto>(`/api/v1/calendar-events?month=${month}`),
    staleTime: 30_000,
  });
}

export function useGoogleCalendarEventsQuery(month: string) {
  return useQuery<{ events: Array<{ id: string; title: string; date: string; color: string; source: "google" }>; connected: boolean }>({
    queryKey: calendarEventKeys.google(month),
    queryFn: () => apiFetch(`/api/v1/google-calendar/events?month=${month}`),
    staleTime: 60_000,
  });
}

export function useCreateCalendarEventMutation() {
  const queryClient = useQueryClient();

  return useMutation<ICalendarEventDto, Error, { title: string; color: string; date: string; addToGoogle?: boolean }>({
    mutationFn: async (input) => {
      const event = await apiFetch<ICalendarEventDto>("/api/v1/calendar-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input.title, color: input.color, date: input.date }),
      });

      if (input.addToGoogle) {
        await apiFetch("/api/v1/google-calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: input.title, date: input.date }),
        }).catch(() => {});
      }

      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
      queryClient.invalidateQueries({ queryKey: ["google-calendar"] });
    },
  });
}

export function useUpdateCalendarEventMutation() {
  const queryClient = useQueryClient();

  return useMutation<ICalendarEventDto, Error, { eventId: string; title?: string; color?: string; date?: string }>({
    mutationFn: ({ eventId, ...updates }) =>
      apiFetch<ICalendarEventDto>(`/api/v1/calendar-events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
    },
  });
}

export function useDeleteCalendarEventMutation() {
  const queryClient = useQueryClient();

  return useMutation<{ deleted: true }, Error, { eventId: string }>({
    mutationFn: ({ eventId }) =>
      apiFetch(`/api/v1/calendar-events/${eventId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calendarEventKeys.all });
    },
  });
}
```

**Step 2: Commit**

```bash
git add apps/nextjs/app/(protected)/_hooks/use-calendar-events.ts
git commit -m "feat(calendar): add React Query hooks for calendar events"
```

---

## Task 10: Frontend — CalendarView refactor + create event dialog

**Files:**
- Modify: `apps/nextjs/app/(protected)/organization/_components/calendar-view.tsx` — replace raw fetch with React Query hooks, add event creation
- Modify: `apps/nextjs/app/(protected)/organization/_components/calendar-grid.tsx` — accept local + google events, clickable cells
- Create: `apps/nextjs/app/(protected)/organization/_components/create-calendar-event-dialog.tsx`
- Create: `apps/nextjs/app/(protected)/organization/_components/google-calendar-dialog.tsx`

**Step 1: Create the event creation dialog**

Dialog with: title input, color palette (8 pastilles), optional "add to Google" checkbox, create/cancel buttons.

**Step 2: Refactor CalendarView**

- Replace `fetch()` with `useCalendarEventsQuery(month)` + `useGoogleCalendarEventsQuery(month)` + existing chronology query
- Merge all 3 sources into a unified `events[]` array for CalendarGrid
- Wire "Lier un calendrier externe" button to GoogleCalendarDialog
- Add state for selected date → opens CreateCalendarEventDialog

**Step 3: Update CalendarGrid**

- Accept unified events array (with `source` field: "local" | "board" | "google")
- Make date cells clickable → call `onDateClick(dateKey)` callback
- Show small source indicator (colored dot) on events

**Step 4: Create Google Calendar dialog (tuto)**

- Steps 1-2-3 with illustrations
- CTA "Connecter Google" button → `authClient.signIn.social({ provider: "google" })`
- If already connected, show "Connecté" status

**Step 5: Run format + type-check**

Run: `pnpm fix && pnpm type-check`

**Step 6: Run full quality check**

Run: `pnpm check:all`

**Step 7: Commit**

```bash
git add apps/nextjs/app/(protected)/organization/_components/
git commit -m "feat(calendar): interactive calendar with event creation and Google Calendar integration"
```

---

## Task 11: Final — quality checks + cleanup

**Step 1: Run all checks**

Run: `pnpm check:all`
Expected: All passing.

**Step 2: Run tests**

Run: `pnpm test -- --run`
Expected: All tests green.

**Step 3: Final commit if any cleanup needed**

```bash
git commit -m "chore(calendar): cleanup and fix lint issues"
```
