import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const POST_REACTION_EMOJIS = [
  "👍",
  "❤️",
  "😂",
  "😮",
  "😢",
  "🎉",
] as const;
export type PostReactionEmoji = (typeof POST_REACTION_EMOJIS)[number];

const postReactionTypeSchema = z.enum(POST_REACTION_EMOJIS, {
  message: "Invalid reaction type",
});

export class PostReactionType extends ValueObject<PostReactionEmoji> {
  protected validate(value: PostReactionEmoji): Result<PostReactionEmoji> {
    const result = postReactionTypeSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid reaction type");
    }

    return Result.ok(result.data);
  }

  static isValidEmoji(emoji: string): emoji is PostReactionEmoji {
    return POST_REACTION_EMOJIS.includes(emoji as PostReactionEmoji);
  }
}
