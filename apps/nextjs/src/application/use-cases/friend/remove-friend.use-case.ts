import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  IRemoveFriendInputDto,
  IRemoveFriendOutputDto,
} from "@/application/dto/friend/remove-friend.dto";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";

export class RemoveFriendUseCase
  implements UseCase<IRemoveFriendInputDto, IRemoveFriendOutputDto>
{
  constructor(private readonly friendRequestRepo: IFriendRequestRepository) {}

  async execute(
    input: IRemoveFriendInputDto & { userId: string },
  ): Promise<Result<IRemoveFriendOutputDto>> {
    const findResult = await this.friendRequestRepo.findByUsers(
      input.userId,
      input.friendUserId,
    );
    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    const friendRequestOption = findResult.getValue();
    if (friendRequestOption.isNone()) {
      return Result.fail("Friendship not found");
    }

    const friendRequest = friendRequestOption.unwrap();

    if (friendRequest.get("status").value !== "accepted") {
      return Result.fail("Friendship not found");
    }

    const deleteResult = await this.friendRequestRepo.delete(friendRequest.id);
    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.getError());
    }

    return Result.ok({
      success: true,
      message: "Friend removed successfully",
    });
  }
}
