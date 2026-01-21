import { z } from "zod";

export const createConversationInputDtoSchema = z.object({
  userId: z.string().uuid(),
  recipientId: z.string().uuid(),
});

export const createConversationOutputDtoSchema = z.object({
  conversationId: z.string().uuid(),
  isNew: z.boolean(),
});

export type ICreateConversationInputDto = z.infer<
  typeof createConversationInputDtoSchema
>;
export type ICreateConversationOutputDto = z.infer<
  typeof createConversationOutputDtoSchema
>;
