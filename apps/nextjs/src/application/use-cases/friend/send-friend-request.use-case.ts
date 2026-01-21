import { match, Result, type UseCase } from "@packages/ddd-kit";
import type {
  ISendFriendRequestInputDto,
  ISendFriendRequestOutputDto,
} from "@/application/dto/friend/send-friend-request.dto";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import { FriendRequest } from "@/domain/friend/friend-request.aggregate";
import { Notification } from "@/domain/notification/notification.aggregate";
import { NotificationType } from "@/domain/notification/value-objects/notification-type.vo";
import type { User } from "@/domain/user/user.aggregate";

export class SendFriendRequestUseCase
  implements UseCase<ISendFriendRequestInputDto, ISendFriendRequestOutputDto>
{
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly friendRequestRepo: IFriendRequestRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly emailProvider: IEmailProvider,
    private readonly appUrl: string,
  ) {}

  async execute(
    input: ISendFriendRequestInputDto & {
      senderId: string;
      senderName: string;
    },
  ): Promise<Result<ISendFriendRequestOutputDto>> {
    const userResult = await this.userRepo.findByEmail(input.receiverEmail);
    if (userResult.isFailure) {
      return Result.fail(userResult.getError());
    }

    return match(userResult.getValue(), {
      Some: (receiver) =>
        this.handleExistingUser(input.senderId, input.senderName, receiver),
      None: () =>
        this.handleNonExistingUser(input.receiverEmail, input.senderName),
    });
  }

  private async handleExistingUser(
    senderId: string,
    senderName: string,
    receiver: User,
  ): Promise<Result<ISendFriendRequestOutputDto>> {
    const receiverId = receiver.id.value.toString();

    if (senderId === receiverId) {
      return Result.fail("Cannot send friend request to yourself");
    }

    const existsResult = await this.friendRequestRepo.existsBetweenUsers(
      senderId,
      receiverId,
    );
    if (existsResult.isFailure) {
      return Result.fail(existsResult.getError());
    }

    if (existsResult.getValue()) {
      return Result.ok({
        requestId: null,
        status: "already_friends",
        message: "A friend request already exists between these users",
      });
    }

    const friendRequestResult = FriendRequest.create({
      senderId,
      receiverId,
    });
    if (friendRequestResult.isFailure) {
      return Result.fail(friendRequestResult.getError());
    }

    const friendRequest = friendRequestResult.getValue();
    const saveResult = await this.friendRequestRepo.create(friendRequest);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    const notificationTypeResult = NotificationType.createFriendRequest();
    if (notificationTypeResult.isFailure) {
      return Result.fail(notificationTypeResult.getError());
    }

    const notificationResult = Notification.create({
      userId: receiverId,
      type: notificationTypeResult.getValue(),
      title: "New Friend Request",
      body: `${senderName} wants to be your friend`,
      data: {
        requestId: friendRequest.id.value.toString(),
        senderId,
        senderName,
      },
    });
    if (notificationResult.isFailure) {
      return Result.fail(notificationResult.getError());
    }

    const notificationSaveResult = await this.notificationRepo.create(
      notificationResult.getValue(),
    );
    if (notificationSaveResult.isFailure) {
      return Result.fail(notificationSaveResult.getError());
    }

    return Result.ok({
      requestId: friendRequest.id.value.toString(),
      status: "request_sent",
      message: "Friend request sent successfully",
    });
  }

  private async handleNonExistingUser(
    receiverEmail: string,
    senderName: string,
  ): Promise<Result<ISendFriendRequestOutputDto>> {
    const signupUrl = `${this.appUrl}/signup?invited_by=${encodeURIComponent(senderName)}`;

    const emailResult = await this.emailProvider.send({
      to: receiverEmail,
      subject: `${senderName} wants to connect with you on HomeCafe`,
      html: `
        <h1>You've been invited to HomeCafe!</h1>
        <p>${senderName} wants to connect with you.</p>
        <p>Join HomeCafe to connect with friends and share your favorite home cafe moments.</p>
        <a href="${signupUrl}" style="display: inline-block; padding: 12px 24px; background-color: #ec4899; color: white; text-decoration: none; border-radius: 8px;">
          Join HomeCafe
        </a>
      `,
    });

    if (emailResult.isFailure) {
      return Result.fail(emailResult.getError());
    }

    return Result.ok({
      requestId: null,
      status: "invitation_sent",
      message: `Invitation email sent to ${receiverEmail}`,
    });
  }
}
