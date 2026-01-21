import { z } from "zod";

export const getInviteLinkInputDtoSchema = z.object({
  userId: z.string().min(1),
});

export const getInviteLinkOutputDtoSchema = z.object({
  inviteUrl: z.string().url(),
  token: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export type IGetInviteLinkInputDto = z.infer<
  typeof getInviteLinkInputDtoSchema
>;
export type IGetInviteLinkOutputDto = z.infer<
  typeof getInviteLinkOutputDtoSchema
>;
