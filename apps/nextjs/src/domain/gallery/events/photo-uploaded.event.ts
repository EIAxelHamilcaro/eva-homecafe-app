import type { DomainEvent } from "@packages/ddd-kit";

export class PhotoUploadedEvent implements DomainEvent {
  public readonly type = "PhotoUploaded";
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
