import type {
  BaseRepository,
  Option,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { FriendRequest } from "@/domain/friend/friend-request.aggregate";
import type { FriendRequestId } from "@/domain/friend/friend-request-id";

export interface IFriendRequestRepository
  extends BaseRepository<FriendRequest> {
  findById(id: FriendRequestId): Promise<Result<Option<FriendRequest>>>;
  findByUsers(
    senderId: string,
    receiverId: string,
  ): Promise<Result<Option<FriendRequest>>>;
  findPendingForUser(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<FriendRequest>>>;
  findFriendsForUser(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<FriendRequest>>>;
  existsBetweenUsers(
    senderId: string,
    receiverId: string,
  ): Promise<Result<boolean>>;
}
