import { Aggregate, UUID } from "@packages/ddd-kit";
import { PushTokenId } from "./push-token-id";

export interface IPushTokenProps {
  userId: string;
  token: string;
  platform: string;
  createdAt: Date;
}

export class PushToken extends Aggregate<IPushTokenProps> {
  get id(): PushTokenId {
    return PushTokenId.create(this._id);
  }

  static create(
    props: Omit<IPushTokenProps, "createdAt">,
    id?: UUID<string>,
  ): PushToken {
    return new PushToken(
      { ...props, createdAt: new Date() },
      id ?? new UUID<string>(),
    );
  }

  static reconstitute(props: IPushTokenProps, id: PushTokenId): PushToken {
    return new PushToken(props, id);
  }
}
