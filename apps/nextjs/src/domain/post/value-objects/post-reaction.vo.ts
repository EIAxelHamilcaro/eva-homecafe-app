import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";
import {
  POST_REACTION_EMOJIS,
  type PostReactionEmoji,
} from "./post-reaction-type.vo";

const postReactionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  emoji: z.enum(POST_REACTION_EMOJIS, {
    message: "Invalid reaction emoji",
  }),
  createdAt: z.date(),
});

export interface IPostReactionProps {
  userId: string;
  emoji: PostReactionEmoji;
  createdAt: Date;
}

export class PostReaction extends ValueObject<IPostReactionProps> {
  get userId(): string {
    return this._value.userId;
  }

  get emoji(): PostReactionEmoji {
    return this._value.emoji;
  }

  get createdAt(): Date {
    return this._value.createdAt;
  }

  protected validate(value: IPostReactionProps): Result<IPostReactionProps> {
    const result = postReactionSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid reaction");
    }

    return Result.ok(result.data);
  }

  static createNew(
    userId: string,
    emoji: PostReactionEmoji,
  ): Result<PostReaction> {
    return PostReaction.create({
      userId,
      emoji,
      createdAt: new Date(),
    });
  }

  equals(other: ValueObject<IPostReactionProps>): boolean {
    return (
      this._value.userId === other.value.userId &&
      this._value.emoji === other.value.emoji
    );
  }

  isSameUserAndEmoji(userId: string, emoji: PostReactionEmoji): boolean {
    return this._value.userId === userId && this._value.emoji === emoji;
  }
}
