import { UUID } from "@packages/ddd-kit";

export class MoodEntryId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "MoodEntryId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): MoodEntryId {
    return new MoodEntryId(id);
  }
}
