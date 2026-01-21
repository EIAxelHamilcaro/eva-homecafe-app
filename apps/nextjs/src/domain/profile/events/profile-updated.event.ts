import type { DomainEvent } from "@packages/ddd-kit";

export class ProfileUpdatedEvent implements DomainEvent {
  public readonly type = "ProfileUpdated";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    profileId: string,
    public readonly userId: string,
  ) {
    this.aggregateId = profileId;
    this.dateTimeOccurred = new Date();
  }
}
