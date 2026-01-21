import { UUID } from "@packages/ddd-kit";

export class NotificationId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "NotificationId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): NotificationId {
    return new NotificationId(id);
  }
}
