import { UUID } from "@packages/ddd-kit";

export class TableauRowId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "TableauRowId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): TableauRowId {
    return new TableauRowId(id);
  }
}
