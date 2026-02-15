import { z } from "zod";

export const deleteCalendarEventInputDtoSchema = z.object({
  eventId: z.string(),
  userId: z.string(),
});

export type IDeleteCalendarEventInputDto = z.infer<
  typeof deleteCalendarEventInputDtoSchema
>;
export type IDeleteCalendarEventOutputDto = { deleted: true };
