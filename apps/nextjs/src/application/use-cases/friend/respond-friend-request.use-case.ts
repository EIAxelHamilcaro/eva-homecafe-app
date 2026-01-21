import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IRespondFriendRequestInputDto,
  IRespondFriendRequestOutputDto,
} from "@/application/dto/friend/respond-friend-request.dto";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import { FriendRequestId } from "@/domain/friend/friend-request-id";
import { Notification } from "@/domain/notification/notification.aggregate";
import { NotificationType } from "@/domain/notification/value-objects/notification-type.vo";

export class RespondFriendRequestUseCase
  implements
    UseCase<IRespondFriendRequestInputDto, IRespondFriendRequestOutputDto>
{
  constructor(
    private readonly friendRequestRepo: IFriendRequestRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly profileRepo: IProfileRepository,
  ) {}

  async execute(
    input: IRespondFriendRequestInputDto & { userId: string },
  ): Promise<Result<IRespondFriendRequestOutputDto>> {
    const friendRequestId = FriendRequestId.create(new UUID(input.requestId));
    const requestResult =
      await this.friendRequestRepo.findById(friendRequestId);
    if (requestResult.isFailure) {
      return Result.fail(requestResult.getError());
    }

    const friendRequestOption = requestResult.getValue();
    if (friendRequestOption.isNone()) {
      return Result.fail("Friend request not found");
    }

    const friendRequest = friendRequestOption.unwrap();

    if (friendRequest.get("receiverId") !== input.userId) {
      return Result.fail(
        "You are not authorized to respond to this friend request",
      );
    }

    if (input.accept) {
      const acceptResult = friendRequest.accept();
      if (acceptResult.isFailure) {
        return Result.fail(acceptResult.getError());
      }
    } else {
      const rejectResult = friendRequest.reject();
      if (rejectResult.isFailure) {
        return Result.fail(rejectResult.getError());
      }
    }

    const updateResult = await this.friendRequestRepo.update(friendRequest);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    if (input.accept) {
      const notifyResult = await this.notifySenderOfAcceptance(
        friendRequest.get("senderId"),
        input.userId,
      );
      if (notifyResult.isFailure) {
        return Result.fail(notifyResult.getError());
      }
    }

    return Result.ok({
      success: true,
      message: input.accept
        ? "Friend request accepted"
        : "Friend request rejected",
    });
  }

  private async notifySenderOfAcceptance(
    senderId: string,
    acceptorId: string,
  ): Promise<Result<void>> {
    const profileResult = await this.profileRepo.findByUserId(acceptorId);
    if (profileResult.isFailure) {
      return Result.fail(profileResult.getError());
    }

    const acceptorName = match(profileResult.getValue(), {
      Some: (profile) => profile.get("displayName").value,
      None: () => "Someone",
    });

    const notificationTypeResult = NotificationType.createFriendAccepted();
    if (notificationTypeResult.isFailure) {
      return Result.fail(notificationTypeResult.getError());
    }

    const notificationResult = Notification.create({
      userId: senderId,
      type: notificationTypeResult.getValue(),
      title: "Friend Request Accepted",
      body: `${acceptorName} accepted your friend request`,
      data: {
        acceptorId,
        acceptorName,
      },
    });
    if (notificationResult.isFailure) {
      return Result.fail(notificationResult.getError());
    }

    const saveResult = await this.notificationRepo.create(
      notificationResult.getValue(),
    );
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok();
  }
}
