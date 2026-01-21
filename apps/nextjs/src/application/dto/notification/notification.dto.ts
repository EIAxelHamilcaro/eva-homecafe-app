import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "friend_request",
  "friend_accepted",
  "new_message",
]);

export const notificationDtoSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  type: notificationTypeSchema,
  title: z.string().min(1),
  body: z.string(),
  data: z.record(z.string(), z.unknown()),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type INotificationDto = z.infer<typeof notificationDtoSchema>;
export type INotificationType = z.infer<typeof notificationTypeSchema>;
