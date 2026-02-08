import { type Option, WatchedList } from "@packages/ddd-kit";
import type { PostReaction } from "../value-objects/post-reaction.vo";
import type { PostReactionEmoji } from "../value-objects/post-reaction-type.vo";

export class PostReactionsList extends WatchedList<PostReaction> {
  private constructor(initialItems?: PostReaction[]) {
    super(initialItems);
  }

  compareItems(a: PostReaction, b: PostReaction): boolean {
    return a.userId === b.userId && a.emoji === b.emoji;
  }

  static create(initialItems?: PostReaction[]): PostReactionsList {
    return new PostReactionsList(initialItems);
  }

  findByUserAndEmoji(
    userId: string,
    emoji: PostReactionEmoji,
  ): Option<PostReaction> {
    return this.find((r) => r.isSameUserAndEmoji(userId, emoji));
  }

  hasUserReactedWith(userId: string, emoji: PostReactionEmoji): boolean {
    return this.findByUserAndEmoji(userId, emoji).isSome();
  }

  getReactionsByEmoji(emoji: PostReactionEmoji): PostReaction[] {
    return this.getItems().filter((r) => r.emoji === emoji);
  }

  getReactionsByUser(userId: string): PostReaction[] {
    return this.getItems().filter((r) => r.userId === userId);
  }
}
