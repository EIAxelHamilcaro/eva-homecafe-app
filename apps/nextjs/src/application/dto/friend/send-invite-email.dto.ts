import { z } from "zod";

export const sendInviteEmailInputDtoSchema = z.object({
  recipientEmail: z.string().email(),
});

export const sendInviteEmailOutputDtoSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type ISendInviteEmailInputDto = z.infer<
  typeof sendInviteEmailInputDtoSchema
>;
export type ISendInviteEmailOutputDto = z.infer<
  typeof sendInviteEmailOutputDtoSchema
>;
