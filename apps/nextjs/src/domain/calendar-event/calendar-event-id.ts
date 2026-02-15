import { UUID } from "@packages/ddd-kit";

export class CalendarEventId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "CalendarEventId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): CalendarEventId {
    return new CalendarEventId(id);
  }
}
