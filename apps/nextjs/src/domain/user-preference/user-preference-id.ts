import { UUID } from "@packages/ddd-kit";

export class UserPreferenceId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "UserPreferenceId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): UserPreferenceId {
    return new UserPreferenceId(id);
  }
}
