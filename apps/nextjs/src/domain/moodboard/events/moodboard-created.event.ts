import type { DomainEvent } from "@packages/ddd-kit";

export class MoodboardCreatedEvent implements DomainEvent {
  public readonly type = "MoodboardCreated";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    moodboardId: string,
    public readonly userId: string,
    public readonly title: string,
  ) {
    this.aggregateId = moodboardId;
    this.dateTimeOccurred = new Date();
  }
}
