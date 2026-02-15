import { z } from "zod";

export const sendJournalRemindersOutputDtoSchema = z.object({
  eligibleUsers: z.number(),
  notificationsSent: z.number(),
});

export type ISendJournalRemindersOutputDto = z.infer<
  typeof sendJournalRemindersOutputDtoSchema
>;
