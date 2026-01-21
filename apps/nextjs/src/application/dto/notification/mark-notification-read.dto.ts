import { z } from "zod";

export const markNotificationReadInputDtoSchema = z.object({
  notificationId: z.string().min(1),
  userId: z.string().min(1),
});

export const markNotificationReadOutputDtoSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type IMarkNotificationReadInputDto = z.infer<
  typeof markNotificationReadInputDtoSchema
>;
export type IMarkNotificationReadOutputDto = z.infer<
  typeof markNotificationReadOutputDtoSchema
>;
