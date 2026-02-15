import { UUID } from "@packages/ddd-kit";

export class ChronologieId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "ChronologieId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): ChronologieId {
    return new ChronologieId(id);
  }
}
