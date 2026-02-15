import { UUID } from "@packages/ddd-kit";

export class TableauId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "TableauId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): TableauId {
    return new TableauId(id);
  }
}
