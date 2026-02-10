import type { DomainEvent } from "@packages/ddd-kit";

export class UserPreferenceUpdatedEvent implements DomainEvent {
  public readonly type = "UserPreferenceUpdated";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    preferenceId: string,
    public readonly userId: string,
  ) {
    this.aggregateId = preferenceId;
    this.dateTimeOccurred = new Date();
  }
}
