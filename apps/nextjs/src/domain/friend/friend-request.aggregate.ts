import {
  Aggregate,
  type Option,
  Option as OptionClass,
  Result,
  UUID,
} from "@packages/ddd-kit";
import { FriendRequestAcceptedEvent } from "./events/friend-request-accepted.event";
import { FriendRequestRejectedEvent } from "./events/friend-request-rejected.event";
import { FriendRequestSentEvent } from "./events/friend-request-sent.event";
import { FriendRequestId } from "./friend-request-id";
import { FriendRequestStatus } from "./value-objects/friend-request-status.vo";

export interface IFriendRequestProps {
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: Date;
  respondedAt: Option<Date>;
}

export class FriendRequest extends Aggregate<IFriendRequestProps> {
  private constructor(props: IFriendRequestProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): FriendRequestId {
    return FriendRequestId.create(this._id);
  }

  static create(
    props: Omit<IFriendRequestProps, "status" | "createdAt" | "respondedAt"> & {
      status?: FriendRequestStatus;
      respondedAt?: Option<Date>;
    },
    id?: UUID<string | number>,
  ): Result<FriendRequest> {
    if (props.senderId === props.receiverId) {
      return Result.fail("Cannot send friend request to yourself");
    }

    let status: FriendRequestStatus;
    if (props.status) {
      status = props.status;
    } else {
      const statusResult = FriendRequestStatus.createPending();
      if (statusResult.isFailure) {
        return Result.fail(statusResult.getError());
      }
      status = statusResult.getValue();
    }

    const newId = id ?? new UUID<string>();

    const friendRequest = new FriendRequest(
      {
        senderId: props.senderId,
        receiverId: props.receiverId,
        status,
        createdAt: new Date(),
        respondedAt: props.respondedAt ?? OptionClass.none(),
      },
      newId,
    );

    friendRequest.addEvent(
      new FriendRequestSentEvent(
        newId.value.toString(),
        props.senderId,
        props.receiverId,
      ),
    );

    return Result.ok(friendRequest);
  }

  static reconstitute(
    props: IFriendRequestProps,
    id: FriendRequestId,
  ): FriendRequest {
    return new FriendRequest(props, id);
  }

  accept(): Result<void> {
    if (!this._props.status.isPending) {
      return Result.fail("Can only accept pending friend requests");
    }

    const statusResult = FriendRequestStatus.createAccepted();
    if (statusResult.isFailure) {
      return Result.fail(statusResult.getError());
    }

    this._props.status = statusResult.getValue();
    this._props.respondedAt = OptionClass.some(new Date());

    this.addEvent(
      new FriendRequestAcceptedEvent(
        this.id.value.toString(),
        this.get("senderId"),
        this.get("receiverId"),
      ),
    );

    return Result.ok();
  }

  reject(): Result<void> {
    if (!this._props.status.isPending) {
      return Result.fail("Can only reject pending friend requests");
    }

    const statusResult = FriendRequestStatus.createRejected();
    if (statusResult.isFailure) {
      return Result.fail(statusResult.getError());
    }

    this._props.status = statusResult.getValue();
    this._props.respondedAt = OptionClass.some(new Date());

    this.addEvent(
      new FriendRequestRejectedEvent(
        this.id.value.toString(),
        this.get("senderId"),
        this.get("receiverId"),
      ),
    );

    return Result.ok();
  }
}
