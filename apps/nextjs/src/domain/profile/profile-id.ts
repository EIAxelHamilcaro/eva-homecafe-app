import { UUID } from "@packages/ddd-kit";

export class ProfileId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "ProfileId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): ProfileId {
    return new ProfileId(id);
  }
}
