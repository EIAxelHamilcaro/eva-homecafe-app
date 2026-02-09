import type { DomainEvent } from "@packages/ddd-kit";

export class PhotoDeletedEvent implements DomainEvent {
  public readonly type = "PhotoDeleted";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    photoId: string,
    public readonly userId: string,
    public readonly url: string,
  ) {
    this.aggregateId = photoId;
    this.dateTimeOccurred = new Date();
  }
}
