import { z } from "zod";
import { POST_REACTION_EMOJIS } from "@/domain/post/value-objects/post-reaction-type.vo";

export const togglePostReactionInputDtoSchema = z.object({
  postId: z.string().min(1),
  userId: z.string().min(1),
  emoji: z.enum(POST_REACTION_EMOJIS),
});

export const togglePostReactionOutputDtoSchema = z.object({
  postId: z.string().min(1),
  userId: z.string().min(1),
  emoji: z.enum(POST_REACTION_EMOJIS),
  action: z.enum(["added", "removed"]),
});

export type ITogglePostReactionInputDto = z.infer<
  typeof togglePostReactionInputDtoSchema
>;
export type ITogglePostReactionOutputDto = z.infer<
  typeof togglePostReactionOutputDtoSchema
>;
