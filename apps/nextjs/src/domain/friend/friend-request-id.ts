import { UUID } from "@packages/ddd-kit";

export class FriendRequestId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "FriendRequestId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): FriendRequestId {
    return new FriendRequestId(id);
  }
}
