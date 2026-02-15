import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  ISendFriendRequestInputDto,
  ISendFriendRequestOutputDto,
} from "@/application/dto/friend/send-friend-request.dto";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type { IInviteTokenRepository } from "@/application/ports/invite-token-repository.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import { EmailTemplates } from "@/application/services/email/templates";
import { FriendRequest } from "@/domain/friend/friend-request.aggregate";
import { Notification } from "@/domain/notification/notification.aggregate";
import { NotificationType } from "@/domain/notification/value-objects/notification-type.vo";
import type { User } from "@/domain/user/user.aggregate";

const INVITE_EXPIRY_HOURS = 24;

export class SendFriendRequestUseCase
  implements UseCase<ISendFriendRequestInputDto, ISendFriendRequestOutputDto>
{
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly friendRequestRepo: IFriendRequestRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly emailProvider: IEmailProvider,
    private readonly eventDispatcher: IEventDispatcher,
    private readonly inviteTokenRepo: IInviteTokenRepository,
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
        this.handleNonExistingUser(
          input.senderId,
          input.receiverEmail,
          input.senderName,
        ),
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

    const existingResult = await this.friendRequestRepo.findByUsers(
      senderId,
      receiverId,
    );
    if (existingResult.isFailure) {
      return Result.fail(existingResult.getError());
    }

    const hasExisting = match(existingResult.getValue(), {
      Some: (existing) => existing,
      None: () => null,
    });

    if (hasExisting) {
      const status = hasExisting.get("status").value;

      if (status === "rejected") {
        await this.friendRequestRepo.delete(hasExisting.id);
      } else {
        return Result.ok({
          requestId: null,
          status: "already_friends",
          message: "A friend request already exists between these users",
        });
      }
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
      title: "Demande d'ami",
      body: `${senderName} souhaite devenir votre ami`,
      data: {
        requestId: friendRequest.id.value.toString(),
        senderId,
        senderName,
      },
    });
    if (notificationResult.isFailure) {
      return Result.fail(notificationResult.getError());
    }

    const notification = notificationResult.getValue();
    const notificationSaveResult =
      await this.notificationRepo.create(notification);
    if (notificationSaveResult.isFailure) {
      return Result.fail(notificationSaveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(notification.domainEvents);
    notification.clearEvents();

    return Result.ok({
      requestId: friendRequest.id.value.toString(),
      status: "request_sent",
      message: "Friend request sent successfully",
    });
  }

  private async handleNonExistingUser(
    senderId: string,
    receiverEmail: string,
    senderName: string,
  ): Promise<Result<ISendFriendRequestOutputDto>> {
    const token = new UUID<string>().value.toString();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + INVITE_EXPIRY_HOURS);

    const createResult = await this.inviteTokenRepo.create(
      senderId,
      token,
      expiresAt,
    );
    if (createResult.isFailure) {
      return Result.fail(createResult.getError());
    }

    const signupUrl = `${this.appUrl}/register?invite_token=${token}`;

    const template = EmailTemplates.friendInvite(senderName, signupUrl);
    const emailResult = await this.emailProvider.send({
      to: receiverEmail,
      subject: template.subject,
      html: template.html,
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
