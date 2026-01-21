import { z } from "zod";
import { REACTION_EMOJIS } from "@/domain/message/value-objects/reaction-type.vo";

export const addReactionInputDtoSchema = z.object({
  messageId: z.string().min(1),
  userId: z.string().min(1),
  emoji: z.enum(REACTION_EMOJIS),
});

export const addReactionOutputDtoSchema = z.object({
  messageId: z.string().min(1),
  userId: z.string().min(1),
  emoji: z.enum(REACTION_EMOJIS),
  action: z.enum(["added", "removed"]),
});

export type IAddReactionInputDto = z.infer<typeof addReactionInputDtoSchema>;
export type IAddReactionOutputDto = z.infer<typeof addReactionOutputDtoSchema>;
