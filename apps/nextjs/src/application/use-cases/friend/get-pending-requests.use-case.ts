import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IGetPendingRequestsInputDto,
  IGetPendingRequestsOutputDto,
  IPendingRequestWithSenderDto,
} from "@/application/dto/friend/get-pending-requests.dto";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { FriendRequest } from "@/domain/friend/friend-request.aggregate";
import { UserId } from "@/domain/user/user-id";

export class GetPendingRequestsUseCase
  implements UseCase<IGetPendingRequestsInputDto, IGetPendingRequestsOutputDto>
{
  constructor(
    private readonly friendRequestRepo: IFriendRequestRepository,
    private readonly userRepo: IUserRepository,
    private readonly profileRepo: IProfileRepository,
  ) {}

  async execute(
    input: IGetPendingRequestsInputDto,
  ): Promise<Result<IGetPendingRequestsOutputDto>> {
    const pagination = {
      page: input.page ?? 1,
      limit: input.limit ?? 20,
    };

    const pendingRequestsResult =
      await this.friendRequestRepo.findPendingForUser(input.userId, pagination);
    if (pendingRequestsResult.isFailure) {
      return Result.fail(pendingRequestsResult.getError());
    }

    const paginatedRequests = pendingRequestsResult.getValue();
    const requests: IPendingRequestWithSenderDto[] = [];

    for (const request of paginatedRequests.data) {
      const requestResult = await this.mapToPendingRequestDto(request);
      if (requestResult.isFailure) {
        return Result.fail(requestResult.getError());
      }
      const pendingRequest = requestResult.getValue();
      if (pendingRequest) {
        requests.push(pendingRequest);
      }
    }

    return Result.ok({
      requests,
      pagination: paginatedRequests.pagination,
    });
  }

  private async mapToPendingRequestDto(
    request: FriendRequest,
  ): Promise<Result<IPendingRequestWithSenderDto | null>> {
    const senderId = request.get("senderId");

    const senderUserIdVO = UserId.create(new UUID(senderId));
    const userResult = await this.userRepo.findById(senderUserIdVO);
    if (userResult.isFailure) {
      return Result.fail(userResult.getError());
    }

    const userOption = userResult.getValue();
    if (userOption.isNone()) {
      return Result.ok(null);
    }

    const user = userOption.unwrap();

    const profileResult = await this.profileRepo.findByUserId(senderId);
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

    const respondedAt = match(request.get("respondedAt"), {
      Some: (date) => date.toISOString(),
      None: () => null,
    });

    return Result.ok({
      id: request.id.value.toString(),
      senderId: request.get("senderId"),
      receiverId: request.get("receiverId"),
      status: request.get("status").value as
        | "pending"
        | "accepted"
        | "rejected",
      createdAt: request.get("createdAt").toISOString(),
      respondedAt,
      senderEmail: user.get("email").value,
      senderName: user.get("name").value,
      senderDisplayName: profileData.displayName,
      senderAvatarUrl: profileData.avatarUrl,
    });
  }
}
