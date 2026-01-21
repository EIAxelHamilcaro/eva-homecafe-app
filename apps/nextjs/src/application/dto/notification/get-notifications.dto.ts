import { z } from "zod";
import { notificationDtoSchema } from "./notification.dto";

export const getNotificationsInputDtoSchema = z.object({
  userId: z.string().min(1),
  unreadOnly: z.boolean().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export const getNotificationsOutputDtoSchema = z.object({
  notifications: z.array(notificationDtoSchema),
  unreadCount: z.number().int().nonnegative(),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});

export type IGetNotificationsInputDto = z.infer<
  typeof getNotificationsInputDtoSchema
>;
export type IGetNotificationsOutputDto = z.infer<
  typeof getNotificationsOutputDtoSchema
>;
