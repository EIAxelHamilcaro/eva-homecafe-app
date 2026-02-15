import {
  createCalendarEventController,
  getCalendarEventsController,
} from "@/adapters/controllers/calendar-event/calendar-event.controller";

export const GET = getCalendarEventsController;
export const POST = createCalendarEventController;
