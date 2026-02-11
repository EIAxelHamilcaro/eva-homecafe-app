import { UUID } from "@packages/ddd-kit";

export class PushTokenId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "PushTokenId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): PushTokenId {
    return new PushTokenId(id);
  }
}
