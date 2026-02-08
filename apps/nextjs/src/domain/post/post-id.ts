import { UUID } from "@packages/ddd-kit";

export class PostId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "PostId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): PostId {
    return new PostId(id);
  }
}
