import type { DomainEvent } from "@packages/ddd-kit";

export class MoodboardDeletedEvent implements DomainEvent {
  public readonly type = "MoodboardDeleted";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    moodboardId: string,
    public readonly userId: string,
  ) {
    this.aggregateId = moodboardId;
    this.dateTimeOccurred = new Date();
  }
}
