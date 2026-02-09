import { UUID } from "@packages/ddd-kit";

export class MoodboardId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "MoodboardId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): MoodboardId {
    return new MoodboardId(id);
  }
}
