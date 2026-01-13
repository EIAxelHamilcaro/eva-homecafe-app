import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";
import { REACTION_EMOJIS, type ReactionEmoji } from "./reaction-type.vo";

const reactionSchema = z.object({
  userId: z.uuid("Invalid user ID format"),
  emoji: z.enum(REACTION_EMOJIS, {
    message: "Invalid reaction emoji",
  }),
  createdAt: z.date(),
});

export interface IReactionProps {
  userId: string;
  emoji: ReactionEmoji;
  createdAt: Date;
}

export class Reaction extends ValueObject<IReactionProps> {
  get userId(): string {
    return this._value.userId;
  }

  get emoji(): ReactionEmoji {
    return this._value.emoji;
  }

  get createdAt(): Date {
    return this._value.createdAt;
  }

  protected validate(value: IReactionProps): Result<IReactionProps> {
    const result = reactionSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid reaction");
    }

    return Result.ok(result.data);
  }

  static createNew(userId: string, emoji: ReactionEmoji): Result<Reaction> {
    return Reaction.create({
      userId,
      emoji,
      createdAt: new Date(),
    });
  }

  equals(other: ValueObject<IReactionProps>): boolean {
    return (
      this._value.userId === other.value.userId &&
      this._value.emoji === other.value.emoji
    );
  }

  isSameUserAndEmoji(userId: string, emoji: ReactionEmoji): boolean {
    return this._value.userId === userId && this._value.emoji === emoji;
  }
}
