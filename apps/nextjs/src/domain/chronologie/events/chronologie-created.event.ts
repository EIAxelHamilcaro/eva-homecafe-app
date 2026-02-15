import type { DomainEvent } from "@packages/ddd-kit";

export class ChronologieCreatedEvent implements DomainEvent {
  public readonly type = "ChronologieCreated";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    chronologieId: string,
    public readonly userId: string,
  ) {
    this.aggregateId = chronologieId;
    this.dateTimeOccurred = new Date();
  }
}
