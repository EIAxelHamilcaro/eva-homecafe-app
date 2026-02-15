import { z } from "zod";

export const deleteConversationInputDtoSchema = z.object({
  conversationId: z.string().min(1),
  userId: z.string().min(1),
});

export const deleteConversationOutputDtoSchema = z.object({
  conversationId: z.string().min(1),
});

export type IDeleteConversationInputDto = z.infer<
  typeof deleteConversationInputDtoSchema
>;
export type IDeleteConversationOutputDto = z.infer<
  typeof deleteConversationOutputDtoSchema
>;
