import { UUID } from "@packages/ddd-kit";

export class ChronologieEntryId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "ChronologieEntryId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): ChronologieEntryId {
    return new ChronologieEntryId(id);
  }
}
