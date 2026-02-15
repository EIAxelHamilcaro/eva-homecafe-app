import { Option, Result, UUID } from "@packages/ddd-kit";
import type { calendarEvent as calendarEventTable } from "@packages/drizzle/schema";
import { CalendarEvent } from "@/domain/calendar-event/calendar-event.aggregate";
import { CalendarEventId } from "@/domain/calendar-event/calendar-event-id";
import {
  EventColor,
  type EventColorValue,
} from "@/domain/calendar-event/value-objects/event-color.vo";
import { EventTitle } from "@/domain/calendar-event/value-objects/event-title.vo";

type CalendarEventRecord = typeof calendarEventTable.$inferSelect;

export function calendarEventToDomain(
  record: CalendarEventRecord,
): Result<CalendarEvent> {
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
