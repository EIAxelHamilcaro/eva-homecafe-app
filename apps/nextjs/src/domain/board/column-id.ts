import { UUID } from "@packages/ddd-kit";

export class ColumnId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "ColumnId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): ColumnId {
    return new ColumnId(id);
  }
}
