import { z } from "zod";
import { friendRequestDtoSchema } from "./friend-request.dto";

export const pendingRequestWithSenderDtoSchema = friendRequestDtoSchema.extend({
  senderEmail: z.string().email(),
  senderName: z.string().nullable(),
  senderDisplayName: z.string().nullable(),
  senderAvatarUrl: z.string().url().nullable(),
});

export const getPendingRequestsInputDtoSchema = z.object({
  userId: z.string().min(1),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export const getPendingRequestsOutputDtoSchema = z.object({
  requests: z.array(pendingRequestWithSenderDtoSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});

export type IPendingRequestWithSenderDto = z.infer<
  typeof pendingRequestWithSenderDtoSchema
>;
export type IGetPendingRequestsInputDto = z.infer<
  typeof getPendingRequestsInputDtoSchema
>;
export type IGetPendingRequestsOutputDto = z.infer<
  typeof getPendingRequestsOutputDtoSchema
>;
