import type { DomainEvent } from "@packages/ddd-kit";

export class ProfileCreatedEvent implements DomainEvent {
  public readonly type = "ProfileCreated";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    profileId: string,
    public readonly userId: string,
    public readonly displayName: string,
  ) {
    this.aggregateId = profileId;
    this.dateTimeOccurred = new Date();
  }
}
