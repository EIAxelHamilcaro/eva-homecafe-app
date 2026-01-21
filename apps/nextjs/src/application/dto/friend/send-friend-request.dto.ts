import { z } from "zod";

export const sendFriendRequestInputDtoSchema = z.object({
  receiverEmail: z.string().email(),
});

export const sendFriendRequestOutputDtoSchema = z.object({
  requestId: z.string().min(1).nullable(),
  status: z.enum(["request_sent", "invitation_sent", "already_friends"]),
  message: z.string(),
});

export type ISendFriendRequestInputDto = z.infer<
  typeof sendFriendRequestInputDtoSchema
>;
export type ISendFriendRequestOutputDto = z.infer<
  typeof sendFriendRequestOutputDtoSchema
>;
