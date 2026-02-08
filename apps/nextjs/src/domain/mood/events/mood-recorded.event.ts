import type { DomainEvent } from "@packages/ddd-kit";

export class MoodRecordedEvent implements DomainEvent {
  public readonly type = "MoodRecorded";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    moodEntryId: string,
    public readonly userId: string,
    public readonly category: string,
    public readonly intensity: number,
  ) {
    this.aggregateId = moodEntryId;
    this.dateTimeOccurred = new Date();
  }
}
