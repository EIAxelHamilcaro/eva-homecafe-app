import { UUID } from "@packages/ddd-kit";

export class BoardId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "BoardId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): BoardId {
    return new BoardId(id);
  }
}
