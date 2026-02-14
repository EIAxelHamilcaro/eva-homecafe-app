import type { DomainEvent } from "@packages/ddd-kit";

export class EmotionRecordedEvent implements DomainEvent {
  public readonly type = "EmotionRecorded";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    emotionEntryId: string,
    public readonly userId: string,
    public readonly category: string,
  ) {
    this.aggregateId = emotionEntryId;
    this.dateTimeOccurred = new Date();
  }
}
