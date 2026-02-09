import { UUID } from "@packages/ddd-kit";

export class PinId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "PinId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): PinId {
    return new PinId(id);
  }
}
