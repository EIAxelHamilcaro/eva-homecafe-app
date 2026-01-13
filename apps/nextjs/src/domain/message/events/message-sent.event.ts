import type { DomainEvent } from "@packages/ddd-kit";

export class MessageSentEvent implements DomainEvent {
  public readonly type = "MessageSent";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    messageId: string,
    public readonly conversationId: string,
    public readonly senderId: string,
    public readonly content: string,
    public readonly hasAttachments: boolean,
  ) {
    this.aggregateId = messageId;
    this.dateTimeOccurred = new Date();
  }
}
