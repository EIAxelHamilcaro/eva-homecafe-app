import { UUID } from "@packages/ddd-kit";

export class CardId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "CardId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): CardId {
    return new CardId(id);
  }
}
