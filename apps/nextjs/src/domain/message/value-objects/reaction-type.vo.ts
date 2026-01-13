import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

const reactionTypeSchema = z.enum(REACTION_EMOJIS, {
  message: "Invalid reaction type",
});

export class ReactionType extends ValueObject<ReactionEmoji> {
  protected validate(value: ReactionEmoji): Result<ReactionEmoji> {
    const result = reactionTypeSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid reaction type");
    }

    return Result.ok(result.data);
  }

  static isValidEmoji(emoji: string): emoji is ReactionEmoji {
    return REACTION_EMOJIS.includes(emoji as ReactionEmoji);
  }
}
