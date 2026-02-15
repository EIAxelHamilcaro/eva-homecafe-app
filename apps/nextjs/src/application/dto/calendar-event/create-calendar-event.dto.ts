import { z } from "zod";
import { EVENT_COLORS } from "@/domain/calendar-event/value-objects/event-color.vo";
import type { ICalendarEventDto } from "./common-calendar-event.dto";

export const createCalendarEventInputDtoSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(100),
  color: z.enum(EVENT_COLORS),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ICreateCalendarEventInputDto = z.infer<
  typeof createCalendarEventInputDtoSchema
>;
export type ICreateCalendarEventOutputDto = ICalendarEventDto;
