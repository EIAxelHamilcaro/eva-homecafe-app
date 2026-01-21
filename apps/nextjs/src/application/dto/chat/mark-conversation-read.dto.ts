import { z } from "zod";

export const markConversationReadInputDtoSchema = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const markConversationReadOutputDtoSchema = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
  readAt: z.date(),
});

export type IMarkConversationReadInputDto = z.infer<
  typeof markConversationReadInputDtoSchema
>;
export type IMarkConversationReadOutputDto = z.infer<
  typeof markConversationReadOutputDtoSchema
>;
