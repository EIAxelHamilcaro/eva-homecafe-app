import type { DomainEvent } from "@packages/ddd-kit";

export class PinRemovedEvent implements DomainEvent {
  public readonly type = "PinRemoved";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    moodboardId: string,
    public readonly pinId: string,
  ) {
    this.aggregateId = moodboardId;
    this.dateTimeOccurred = new Date();
  }
}
