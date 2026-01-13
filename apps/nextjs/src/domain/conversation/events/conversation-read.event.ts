import type { DomainEvent } from "@packages/ddd-kit";

export class ConversationReadEvent implements DomainEvent {
  public readonly type = "ConversationRead";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    conversationId: string,
    public readonly userId: string,
    public readonly readAt: Date,
  ) {
    this.aggregateId = conversationId;
    this.dateTimeOccurred = new Date();
  }
}
