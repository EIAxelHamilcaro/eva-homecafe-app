import type { DomainEvent } from "@packages/ddd-kit";
import type { ReactionEmoji } from "../value-objects/reaction-type.vo";

export class MessageReactionAddedEvent implements DomainEvent {
  public readonly type = "MessageReactionAdded";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    messageId: string,
    public readonly conversationId: string,
    public readonly userId: string,
    public readonly emoji: ReactionEmoji,
  ) {
    this.aggregateId = messageId;
    this.dateTimeOccurred = new Date();
  }
}
