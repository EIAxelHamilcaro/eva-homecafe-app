import { Option, Result, UUID } from "@packages/ddd-kit";
import type { friendRequest as friendRequestTable } from "@packages/drizzle/schema";
import { FriendRequest } from "@/domain/friend/friend-request.aggregate";
import { FriendRequestId } from "@/domain/friend/friend-request-id";
import {
  FriendRequestStatus,
  type FriendRequestStatusType,
} from "@/domain/friend/value-objects/friend-request-status.vo";

type FriendRequestRecord = typeof friendRequestTable.$inferSelect;

type FriendRequestPersistence = Omit<
  FriendRequestRecord,
  "createdAt" | "respondedAt"
> & {
  createdAt?: Date;
  respondedAt?: Date | null;
};

export function friendRequestToDomain(
  record: FriendRequestRecord,
): Result<FriendRequest> {
  const statusResult = FriendRequestStatus.create(
    record.status as FriendRequestStatusType,
  );
  if (statusResult.isFailure) {
    return Result.fail(statusResult.getError());
  }

  const friendRequest = FriendRequest.reconstitute(
    {
      senderId: record.senderId,
      receiverId: record.receiverId,
      status: statusResult.getValue(),
      createdAt: record.createdAt,
      respondedAt: Option.fromNullable(record.respondedAt),
    },
    FriendRequestId.create(new UUID(record.id)),
  );

  return Result.ok(friendRequest);
}

export function friendRequestToPersistence(
  friendRequest: FriendRequest,
): FriendRequestPersistence {
  const respondedAt = friendRequest.get("respondedAt");

  return {
    id: friendRequest.id.value.toString(),
    senderId: friendRequest.get("senderId"),
    receiverId: friendRequest.get("receiverId"),
    status: friendRequest.get("status").value,
    createdAt: friendRequest.get("createdAt"),
    respondedAt: respondedAt.isSome() ? respondedAt.unwrap() : null,
  };
}
