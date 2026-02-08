import type { DomainEvent } from "@packages/ddd-kit";

export class CardCompletedEvent implements DomainEvent {
  public readonly type = "CardCompleted";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    boardId: string,
    public readonly cardId: string,
    public readonly userId: string,
  ) {
    this.aggregateId = boardId;
    this.dateTimeOccurred = new Date();
  }
}
