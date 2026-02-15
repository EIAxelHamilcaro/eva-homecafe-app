import type { DomainEvent } from "@packages/ddd-kit";

export class TableauCreatedEvent implements DomainEvent {
  public readonly type = "TableauCreated";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    tableauId: string,
    public readonly userId: string,
  ) {
    this.aggregateId = tableauId;
    this.dateTimeOccurred = new Date();
  }
}
