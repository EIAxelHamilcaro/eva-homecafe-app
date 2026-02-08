import type { DomainEvent } from "@packages/ddd-kit";
import type { PostReactionEmoji } from "../value-objects/post-reaction-type.vo";

export class PostReactedEvent implements DomainEvent {
  public readonly type = "PostReacted";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    postId: string,
    public readonly userId: string,
    public readonly emoji: PostReactionEmoji,
    public readonly action: "added" | "removed",
  ) {
    this.aggregateId = postId;
    this.dateTimeOccurred = new Date();
  }
}
