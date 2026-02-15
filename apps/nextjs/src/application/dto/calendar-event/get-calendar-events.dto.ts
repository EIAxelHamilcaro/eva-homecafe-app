import { z } from "zod";
import type { ICalendarEventDto } from "./common-calendar-event.dto";

export const getCalendarEventsInputDtoSchema = z.object({
  userId: z.string(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export type IGetCalendarEventsInputDto = z.infer<
  typeof getCalendarEventsInputDtoSchema
>;
export type IGetCalendarEventsOutputDto = { events: ICalendarEventDto[] };
