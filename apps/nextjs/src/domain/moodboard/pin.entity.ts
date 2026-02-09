import { Entity, type Option, UUID } from "@packages/ddd-kit";
import { PinId } from "./pin-id";
import type { HexColor } from "./value-objects/hex-color.vo";
import type { PinType } from "./value-objects/pin-type.vo";

export interface IPinProps {
  type: PinType;
  imageUrl: Option<string>;
  color: Option<HexColor>;
  position: number;
  createdAt: Date;
}

export class Pin extends Entity<IPinProps> {
  private constructor(props: IPinProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): PinId {
    return PinId.create(this._id);
  }

  static create(
    props: {
      type: PinType;
      imageUrl: Option<string>;
      color: Option<HexColor>;
      position: number;
    },
    id?: UUID<string | number>,
  ): Pin {
    return new Pin(
      {
        type: props.type,
        imageUrl: props.imageUrl,
        color: props.color,
        position: props.position,
        createdAt: new Date(),
      },
      id ?? new UUID(),
    );
  }

  updatePosition(position: number): void {
    this._props.position = position;
  }

  static reconstitute(props: IPinProps, id: PinId): Pin {
    return new Pin(props, id);
  }
}
