import { z } from "zod";

export const markConversationReadInputDtoSchema = z.object({
  conversationId: z.string().min(1),
  userId: z.string().min(1),
});

export const markConversationReadOutputDtoSchema = z.object({
  conversationId: z.string().min(1),
  userId: z.string().min(1),
  readAt: z.date(),
});

export type IMarkConversationReadInputDto = z.infer<
  typeof markConversationReadInputDtoSchema
>;
export type IMarkConversationReadOutputDto = z.infer<
  typeof markConversationReadOutputDtoSchema
>;
