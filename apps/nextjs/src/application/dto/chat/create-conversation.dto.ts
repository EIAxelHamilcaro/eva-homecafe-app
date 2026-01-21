import { z } from "zod";

export const createConversationInputDtoSchema = z.object({
  userId: z.string().min(1),
  recipientId: z.string().min(1),
});

export const createConversationOutputDtoSchema = z.object({
  conversationId: z.string().min(1),
  isNew: z.boolean(),
});

export type ICreateConversationInputDto = z.infer<
  typeof createConversationInputDtoSchema
>;
export type ICreateConversationOutputDto = z.infer<
  typeof createConversationOutputDtoSchema
>;
