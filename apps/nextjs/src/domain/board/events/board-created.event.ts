import type { DomainEvent } from "@packages/ddd-kit";

export class BoardCreatedEvent implements DomainEvent {
  public readonly type = "BoardCreated";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    boardId: string,
    public readonly userId: string,
    public readonly boardType: string,
  ) {
    this.aggregateId = boardId;
    this.dateTimeOccurred = new Date();
  }
}
