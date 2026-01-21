import { z } from "zod";

export const respondFriendRequestInputDtoSchema = z.object({
  requestId: z.string().min(1),
  accept: z.boolean(),
});

export const respondFriendRequestOutputDtoSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type IRespondFriendRequestInputDto = z.infer<
  typeof respondFriendRequestInputDtoSchema
>;
export type IRespondFriendRequestOutputDto = z.infer<
  typeof respondFriendRequestOutputDtoSchema
>;
