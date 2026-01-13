import { type Option, WatchedList } from "@packages/ddd-kit";
import type { Reaction } from "../value-objects/reaction.vo";
import type { ReactionEmoji } from "../value-objects/reaction-type.vo";

export class ReactionsList extends WatchedList<Reaction> {
  private constructor(initialItems?: Reaction[]) {
    super(initialItems);
  }

  compareItems(a: Reaction, b: Reaction): boolean {
    return a.userId === b.userId && a.emoji === b.emoji;
  }

  static create(initialItems?: Reaction[]): ReactionsList {
    return new ReactionsList(initialItems);
  }

  findByUserAndEmoji(userId: string, emoji: ReactionEmoji): Option<Reaction> {
    return this.find((r) => r.isSameUserAndEmoji(userId, emoji));
  }

  hasUserReactedWith(userId: string, emoji: ReactionEmoji): boolean {
    return this.findByUserAndEmoji(userId, emoji).isSome();
  }

  getReactionsByEmoji(emoji: ReactionEmoji): Reaction[] {
    return this.getItems().filter((r) => r.emoji === emoji);
  }

  getReactionsByUser(userId: string): Reaction[] {
    return this.getItems().filter((r) => r.userId === userId);
  }
}
