import {
  createPaginatedResult,
  DEFAULT_PAGINATION,
  Option,
  type PaginatedResult,
  type PaginationParams,
  Result,
} from "@packages/ddd-kit";
import {
  and,
  asc,
  type DbClient,
  db,
  eq,
  gte,
  lt,
  count as sqlCount,
  type Transaction,
} from "@packages/drizzle";
import { calendarEvent as calendarEventTable } from "@packages/drizzle/schema";
import {
  calendarEventToDomain,
  calendarEventToPersistence,
} from "@/adapters/mappers/calendar-event.mapper";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";
import type { CalendarEvent } from "@/domain/calendar-event/calendar-event.aggregate";
import type { CalendarEventId } from "@/domain/calendar-event/calendar-event-id";

export class DrizzleCalendarEventRepository
  implements ICalendarEventRepository
{
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(
    entity: CalendarEvent,
    trx?: Transaction,
  ): Promise<Result<CalendarEvent>> {
    try {
      const data = calendarEventToPersistence(entity);
      await this.getDb(trx).insert(calendarEventTable).values(data);
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create calendar event: ${error}`);
    }
  }

  async update(
    entity: CalendarEvent,
    trx?: Transaction,
  ): Promise<Result<CalendarEvent>> {
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

  async delete(
    id: CalendarEventId,
    trx?: Transaction,
  ): Promise<Result<CalendarEventId>> {
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

  async findByUserIdAndMonth(
    userId: string,
    month: string,
  ): Promise<Result<CalendarEvent[]>> {
    try {
      const [year, m] = month.split("-").map(Number);
      const startDate = `${year}-${String(m).padStart(2, "0")}-01`;
      const nextMonth =
        m === 12
          ? `${(year as number) + 1}-01-01`
          : `${year}-${String((m as number) + 1).padStart(2, "0")}-01`;

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

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<CalendarEvent>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;
      const [records, countResult] = await Promise.all([
        db
          .select()
          .from(calendarEventTable)
          .orderBy(asc(calendarEventTable.date))
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);
      if (countResult.isFailure) return Result.fail(countResult.getError());
      const events: CalendarEvent[] = [];
      for (const record of records) {
        const r = calendarEventToDomain(record);
        if (r.isFailure) return Result.fail(r.getError());
        events.push(r.getValue());
      }
      return Result.ok(
        createPaginatedResult(events, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(`Failed to find all calendar events: ${error}`);
    }
  }

  async findMany(
    _props: Partial<CalendarEvent["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<CalendarEvent>>> {
    return this.findAll(pagination);
  }

  async findBy(
    _props: Partial<CalendarEvent["_props"]>,
  ): Promise<Result<Option<CalendarEvent>>> {
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
      const [result] = await db
        .select({ value: sqlCount() })
        .from(calendarEventTable);
      return Result.ok(result?.value ?? 0);
    } catch (error) {
      return Result.fail(`Failed to count calendar events: ${error}`);
    }
  }
}
