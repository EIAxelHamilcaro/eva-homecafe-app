import { z } from "zod";
import { EVENT_COLORS } from "@/domain/calendar-event/value-objects/event-color.vo";
import type { ICalendarEventDto } from "./common-calendar-event.dto";

export const updateCalendarEventInputDtoSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
  title: z.string().min(1).max(100).optional(),
  color: z.enum(EVENT_COLORS).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type IUpdateCalendarEventInputDto = z.infer<
  typeof updateCalendarEventInputDtoSchema
>;
export type IUpdateCalendarEventOutputDto = ICalendarEventDto;
