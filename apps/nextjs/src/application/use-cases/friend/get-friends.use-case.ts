import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type { IFriendDto } from "@/application/dto/friend/friend-request.dto";
import type {
  IGetFriendsInputDto,
  IGetFriendsOutputDto,
} from "@/application/dto/friend/get-friends.dto";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { FriendRequest } from "@/domain/friend/friend-request.aggregate";
import { UserId } from "@/domain/user/user-id";

export class GetFriendsUseCase
  implements UseCase<IGetFriendsInputDto, IGetFriendsOutputDto>
{
  constructor(
    private readonly friendRequestRepo: IFriendRequestRepository,
    private readonly userRepo: IUserRepository,
    private readonly profileRepo: IProfileRepository,
  ) {}

  async execute(
    input: IGetFriendsInputDto,
  ): Promise<Result<IGetFriendsOutputDto>> {
    const pagination = {
      page: input.page ?? 1,
      limit: input.limit ?? 20,
    };

    const friendRequestsResult =
      await this.friendRequestRepo.findFriendsForUser(input.userId, pagination);
    if (friendRequestsResult.isFailure) {
      return Result.fail(friendRequestsResult.getError());
    }

    const paginatedRequests = friendRequestsResult.getValue();
    const friends: IFriendDto[] = [];

    for (const request of paginatedRequests.data) {
      const friendResult = await this.mapToFriendDto(request, input.userId);
      if (friendResult.isFailure) {
        return Result.fail(friendResult.getError());
      }
      const friend = friendResult.getValue();
      if (friend) {
        friends.push(friend);
      }
    }

    return Result.ok({
      friends,
      pagination: paginatedRequests.pagination,
    });
  }

  private async mapToFriendDto(
    request: FriendRequest,
    currentUserId: string,
  ): Promise<Result<IFriendDto | null>> {
    const friendUserId =
      request.get("senderId") === currentUserId
        ? request.get("receiverId")
        : request.get("senderId");

    const friendUserIdVO = UserId.create(new UUID(friendUserId));
    const userResult = await this.userRepo.findById(friendUserIdVO);
    if (userResult.isFailure) {
      return Result.fail(userResult.getError());
    }

    const userOption = userResult.getValue();
    if (userOption.isNone()) {
      return Result.ok(null);
    }

    const user = userOption.unwrap();

    const profileResult = await this.profileRepo.findByUserId(friendUserId);
    if (profileResult.isFailure) {
      return Result.fail(profileResult.getError());
    }

    const profileData = match(profileResult.getValue(), {
      Some: (profile) => ({
        displayName: profile.get("displayName").value as string | null,
        avatarUrl: profile.get("avatarUrl").toNull() as string | null,
      }),
      None: () => ({
        displayName: null as string | null,
        avatarUrl: null as string | null,
      }),
    });

    return Result.ok({
      id: friendUserId,
      userId: friendUserId,
      email: user.get("email").value,
      name: user.get("name").value,
      displayName: profileData.displayName,
      avatarUrl: profileData.avatarUrl,
    });
  }
}
