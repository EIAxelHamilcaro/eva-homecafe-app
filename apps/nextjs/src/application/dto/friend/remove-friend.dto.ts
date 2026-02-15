import { z } from "zod";

export const removeFriendInputDtoSchema = z.object({
  friendUserId: z.string().min(1),
});

export const removeFriendOutputDtoSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type IRemoveFriendInputDto = z.infer<typeof removeFriendInputDtoSchema>;
export type IRemoveFriendOutputDto = z.infer<
  typeof removeFriendOutputDtoSchema
>;
