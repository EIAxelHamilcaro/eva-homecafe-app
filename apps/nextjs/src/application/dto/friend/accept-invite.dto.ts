import { z } from "zod";

export const acceptInviteInputDtoSchema = z.object({
  token: z.string().min(1),
  userId: z.string().min(1),
});

export const acceptInviteOutputDtoSchema = z.object({
  success: z.boolean(),
  friendId: z.string().min(1).nullable(),
  friendName: z.string().nullable(),
  message: z.string(),
});

export type IAcceptInviteInputDto = z.infer<typeof acceptInviteInputDtoSchema>;
export type IAcceptInviteOutputDto = z.infer<
  typeof acceptInviteOutputDtoSchema
>;
