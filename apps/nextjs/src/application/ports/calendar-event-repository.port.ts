import type { BaseRepository, Result } from "@packages/ddd-kit";
import type { CalendarEvent } from "@/domain/calendar-event/calendar-event.aggregate";

export interface ICalendarEventRepository
  extends BaseRepository<CalendarEvent> {
  findByUserIdAndMonth(
    userId: string,
    month: string,
  ): Promise<Result<CalendarEvent[]>>;
}
