import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const FriendRequestStatusEnum = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export type FriendRequestStatusType =
  (typeof FriendRequestStatusEnum)[keyof typeof FriendRequestStatusEnum];

const schema = z.enum(["pending", "accepted", "rejected"]);

export class FriendRequestStatus extends ValueObject<FriendRequestStatusType> {
  protected validate(
    value: FriendRequestStatusType,
  ): Result<FriendRequestStatusType> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(
        firstIssue?.message ?? "Invalid friend request status",
      );
    }
    return Result.ok(result.data);
  }

  get isPending(): boolean {
    return this.value === FriendRequestStatusEnum.PENDING;
  }

  get isAccepted(): boolean {
    return this.value === FriendRequestStatusEnum.ACCEPTED;
  }

  get isRejected(): boolean {
    return this.value === FriendRequestStatusEnum.REJECTED;
  }

  static createPending(): Result<FriendRequestStatus> {
    return FriendRequestStatus.create(
      FriendRequestStatusEnum.PENDING as FriendRequestStatusType,
    ) as Result<FriendRequestStatus>;
  }

  static createAccepted(): Result<FriendRequestStatus> {
    return FriendRequestStatus.create(
      FriendRequestStatusEnum.ACCEPTED as FriendRequestStatusType,
    ) as Result<FriendRequestStatus>;
  }

  static createRejected(): Result<FriendRequestStatus> {
    return FriendRequestStatus.create(
      FriendRequestStatusEnum.REJECTED as FriendRequestStatusType,
    ) as Result<FriendRequestStatus>;
  }
}
