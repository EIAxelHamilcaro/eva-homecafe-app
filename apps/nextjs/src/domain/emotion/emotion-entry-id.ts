import { UUID } from "@packages/ddd-kit";

export class EmotionEntryId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "EmotionEntryId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): EmotionEntryId {
    return new EmotionEntryId(id);
  }
}
