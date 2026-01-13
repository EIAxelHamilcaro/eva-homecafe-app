import type { DomainEvent } from "@packages/ddd-kit";

export class ConversationCreatedEvent implements DomainEvent {
  public readonly type = "ConversationCreated";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    conversationId: string,
    public readonly participantIds: string[],
    public readonly createdBy: string,
  ) {
    this.aggregateId = conversationId;
    this.dateTimeOccurred = new Date();
  }
}
