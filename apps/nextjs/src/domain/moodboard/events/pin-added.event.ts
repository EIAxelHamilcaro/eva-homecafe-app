import type { DomainEvent } from "@packages/ddd-kit";

export class PinAddedEvent implements DomainEvent {
  public readonly type = "PinAdded";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    moodboardId: string,
    public readonly pinId: string,
    public readonly pinType: string,
  ) {
    this.aggregateId = moodboardId;
    this.dateTimeOccurred = new Date();
  }
}
