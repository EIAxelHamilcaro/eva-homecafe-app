import {
  match,
  Option as OptionClass,
  Result,
  type UseCase,
  UUID,
} from "@packages/ddd-kit";
import type {
  IAcceptInviteInputDto,
  IAcceptInviteOutputDto,
} from "@/application/dto/friend/accept-invite.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type { IInviteTokenRepository } from "@/application/ports/invite-token-repository.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import { FriendRequest } from "@/domain/friend/friend-request.aggregate";
import { FriendRequestStatus } from "@/domain/friend/value-objects/friend-request-status.vo";
import { Notification } from "@/domain/notification/notification.aggregate";
import { NotificationType } from "@/domain/notification/value-objects/notification-type.vo";
import { UserId } from "@/domain/user/user-id";

export class AcceptInviteLinkUseCase
  implements UseCase<IAcceptInviteInputDto, IAcceptInviteOutputDto>
{
  constructor(
    private readonly inviteTokenRepo: IInviteTokenRepository,
    private readonly friendRequestRepo: IFriendRequestRepository,
    private readonly userRepo: IUserRepository,
    private readonly profileRepo: IProfileRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IAcceptInviteInputDto,
  ): Promise<Result<IAcceptInviteOutputDto>> {
    const tokenResult = await this.inviteTokenRepo.findByToken(input.token);
    if (tokenResult.isFailure) {
      return Result.fail(tokenResult.getError());
    }

    const tokenOption = tokenResult.getValue();
    if (tokenOption.isNone()) {
      return Result.ok({
        success: false,
        friendId: null,
        friendName: null,
        message: "Invalid invite link",
      });
    }

    const inviteToken = tokenOption.unwrap();

    if (inviteToken.usedAt !== null) {
      return Result.ok({
        success: false,
        friendId: null,
        friendName: null,
        message: "This invite link has already been used",
      });
    }

    if (new Date() > inviteToken.expiresAt) {
      return Result.ok({
        success: false,
        friendId: null,
        friendName: null,
        message: "This invite link has expired",
      });
    }

    const inviterId = inviteToken.userId;

    if (inviterId === input.userId) {
      return Result.ok({
        success: false,
        friendId: null,
        friendName: null,
        message: "You cannot accept your own invite link",
      });
    }

    const existsResult = await this.friendRequestRepo.existsBetweenUsers(
      inviterId,
      input.userId,
    );
    if (existsResult.isFailure) {
      return Result.fail(existsResult.getError());
    }

    if (existsResult.getValue()) {
      return Result.ok({
        success: false,
        friendId: null,
        friendName: null,
        message: "You are already connected with this user",
      });
    }

    const inviterUserIdVO = UserId.create(new UUID(inviterId));
    const inviterResult = await this.userRepo.findById(inviterUserIdVO);
    if (inviterResult.isFailure) {
      return Result.fail(inviterResult.getError());
    }

    const inviterOption = inviterResult.getValue();
    if (inviterOption.isNone()) {
      return Result.ok({
        success: false,
        friendId: null,
        friendName: null,
        message: "The user who created this invite no longer exists",
      });
    }

    const inviter = inviterOption.unwrap();

    const acceptedStatusResult = FriendRequestStatus.createAccepted();
    if (acceptedStatusResult.isFailure) {
      return Result.fail(acceptedStatusResult.getError());
    }

    const friendRequestResult = FriendRequest.create({
      senderId: inviterId,
      receiverId: input.userId,
      status: acceptedStatusResult.getValue(),
      respondedAt: OptionClass.some(new Date()),
    });
    if (friendRequestResult.isFailure) {
      return Result.fail(friendRequestResult.getError());
    }

    const friendRequest = friendRequestResult.getValue();
    const saveResult = await this.friendRequestRepo.create(friendRequest);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    const markUsedResult = await this.inviteTokenRepo.markAsUsed(input.token);
    if (markUsedResult.isFailure) {
      return Result.fail(markUsedResult.getError());
    }

    const notifyResult = await this.createNotifications(
      inviterId,
      input.userId,
    );
    if (notifyResult.isFailure) {
      return Result.fail(notifyResult.getError());
    }

    const inviterProfileResult = await this.profileRepo.findByUserId(inviterId);
    let friendName = inviter.get("name").value;
    if (inviterProfileResult.isSuccess) {
      friendName = match(inviterProfileResult.getValue(), {
        Some: (profile) =>
          profile.get("displayName").value ?? inviter.get("name").value,
        None: () => inviter.get("name").value,
      });
    }

    return Result.ok({
      success: true,
      friendId: inviterId,
      friendName,
      message: "You are now friends!",
    });
  }

  private async createNotifications(
    inviterId: string,
    acceptorId: string,
  ): Promise<Result<void>> {
    const acceptorProfileResult =
      await this.profileRepo.findByUserId(acceptorId);
    let acceptorName = "Someone";
    if (acceptorProfileResult.isSuccess) {
      acceptorName = match(acceptorProfileResult.getValue(), {
        Some: (profile) => profile.get("displayName").value ?? "Someone",
        None: () => "Someone",
      });
    }

    const inviterProfileResult = await this.profileRepo.findByUserId(inviterId);
    let inviterName = "Someone";
    if (inviterProfileResult.isSuccess) {
      inviterName = match(inviterProfileResult.getValue(), {
        Some: (profile) => profile.get("displayName").value ?? "Someone",
        None: () => "Someone",
      });
    }

    const friendAcceptedTypeResult = NotificationType.createFriendAccepted();
    if (friendAcceptedTypeResult.isFailure) {
      return Result.fail(friendAcceptedTypeResult.getError());
    }

    const notificationForInviterResult = Notification.create({
      userId: inviterId,
      type: friendAcceptedTypeResult.getValue(),
      title: "Nouvel ami",
      body: `${acceptorName} a accepté votre lien d'invitation`,
      data: {
        acceptorId,
        acceptorName,
      },
    });
    if (notificationForInviterResult.isFailure) {
      return Result.fail(notificationForInviterResult.getError());
    }

    const inviterNotification = notificationForInviterResult.getValue();
    const saveInviterNotification =
      await this.notificationRepo.create(inviterNotification);
    if (saveInviterNotification.isFailure) {
      return Result.fail(saveInviterNotification.getError());
    }

    await this.eventDispatcher.dispatchAll(inviterNotification.domainEvents);
    inviterNotification.clearEvents();

    const notificationForAcceptorResult = Notification.create({
      userId: acceptorId,
      type: friendAcceptedTypeResult.getValue(),
      title: "Nouvel ami",
      body: `Vous êtes maintenant ami avec ${inviterName}`,
      data: {
        friendId: inviterId,
        friendName: inviterName,
      },
    });
    if (notificationForAcceptorResult.isFailure) {
      return Result.fail(notificationForAcceptorResult.getError());
    }

    const acceptorNotification = notificationForAcceptorResult.getValue();
    const saveAcceptorNotification =
      await this.notificationRepo.create(acceptorNotification);
    if (saveAcceptorNotification.isFailure) {
      return Result.fail(saveAcceptorNotification.getError());
    }

    await this.eventDispatcher.dispatchAll(acceptorNotification.domainEvents);
    acceptorNotification.clearEvents();

    return Result.ok();
  }
}
