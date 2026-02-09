import { UUID } from "@packages/ddd-kit";

export class PhotoId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "PhotoId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): PhotoId {
    return new PhotoId(id);
  }
}
