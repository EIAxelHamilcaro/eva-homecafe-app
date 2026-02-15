import { z } from "zod";
import type { CalendarEvent } from "@/domain/calendar-event/calendar-event.aggregate";
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
