import { createModule } from "@evyweb/ioctopus";
import { DrizzleFriendRequestRepository } from "@/adapters/repositories/friend-request.repository";
import { DrizzleInviteTokenRepository } from "@/adapters/repositories/invite-token.repository";
import { DrizzleNotificationRepository } from "@/adapters/repositories/notification.repository";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type { IInviteTokenRepository } from "@/application/ports/invite-token-repository.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import { AcceptInviteLinkUseCase } from "@/application/use-cases/friend/accept-invite-link.use-case";
import { GetFriendsUseCase } from "@/application/use-cases/friend/get-friends.use-case";
import { GetInviteLinkUseCase } from "@/application/use-cases/friend/get-invite-link.use-case";
import { GetPendingRequestsUseCase } from "@/application/use-cases/friend/get-pending-requests.use-case";
import { RemoveFriendUseCase } from "@/application/use-cases/friend/remove-friend.use-case";
import { RespondFriendRequestUseCase } from "@/application/use-cases/friend/respond-friend-request.use-case";
import { SendFriendRequestUseCase } from "@/application/use-cases/friend/send-friend-request.use-case";
import { SendInviteEmailUseCase } from "@/application/use-cases/friend/send-invite-email.use-case";
import { DI_SYMBOLS } from "../types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const MOBILE_APP_SCHEME =
  process.env.MOBILE_APP_SCHEME ?? "evahomecafeapp://invite";

export const createFriendModule = () => {
  const friendModule = createModule();

  friendModule
    .bind(DI_SYMBOLS.IFriendRequestRepository)
    .toClass(DrizzleFriendRequestRepository);

  friendModule
    .bind(DI_SYMBOLS.IInviteTokenRepository)
    .toClass(DrizzleInviteTokenRepository);

  friendModule
    .bind(DI_SYMBOLS.INotificationRepository)
    .toClass(DrizzleNotificationRepository);

  friendModule
    .bind(DI_SYMBOLS.SendFriendRequestUseCase)
    .toHigherOrderFunction(
      (
        userRepo: IUserRepository,
        friendRequestRepo: IFriendRequestRepository,
        notificationRepo: INotificationRepository,
        emailProvider: IEmailProvider,
        eventDispatcher: IEventDispatcher,
        inviteTokenRepo: IInviteTokenRepository,
      ) =>
        new SendFriendRequestUseCase(
          userRepo,
          friendRequestRepo,
          notificationRepo,
          emailProvider,
          eventDispatcher,
          inviteTokenRepo,
          APP_URL,
        ),
      [
        DI_SYMBOLS.IUserRepository,
        DI_SYMBOLS.IFriendRequestRepository,
        DI_SYMBOLS.INotificationRepository,
        DI_SYMBOLS.IEmailProvider,
        DI_SYMBOLS.IEventDispatcher,
        DI_SYMBOLS.IInviteTokenRepository,
      ],
    );

  friendModule
    .bind(DI_SYMBOLS.RespondFriendRequestUseCase)
    .toClass(RespondFriendRequestUseCase, [
      DI_SYMBOLS.IFriendRequestRepository,
      DI_SYMBOLS.INotificationRepository,
      DI_SYMBOLS.IProfileRepository,
      DI_SYMBOLS.IUserRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  friendModule
    .bind(DI_SYMBOLS.GetFriendsUseCase)
    .toClass(GetFriendsUseCase, [
      DI_SYMBOLS.IFriendRequestRepository,
      DI_SYMBOLS.IUserRepository,
      DI_SYMBOLS.IProfileRepository,
    ]);

  friendModule
    .bind(DI_SYMBOLS.GetPendingRequestsUseCase)
    .toClass(GetPendingRequestsUseCase, [
      DI_SYMBOLS.IFriendRequestRepository,
      DI_SYMBOLS.IUserRepository,
      DI_SYMBOLS.IProfileRepository,
    ]);

  friendModule
    .bind(DI_SYMBOLS.GetInviteLinkUseCase)
    .toHigherOrderFunction(
      (inviteTokenRepo: IInviteTokenRepository) =>
        new GetInviteLinkUseCase(inviteTokenRepo, MOBILE_APP_SCHEME),
      [DI_SYMBOLS.IInviteTokenRepository],
    );

  friendModule
    .bind(DI_SYMBOLS.AcceptInviteLinkUseCase)
    .toClass(AcceptInviteLinkUseCase, [
      DI_SYMBOLS.IInviteTokenRepository,
      DI_SYMBOLS.IFriendRequestRepository,
      DI_SYMBOLS.IUserRepository,
      DI_SYMBOLS.IProfileRepository,
      DI_SYMBOLS.INotificationRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  friendModule
    .bind(DI_SYMBOLS.RemoveFriendUseCase)
    .toClass(RemoveFriendUseCase, [DI_SYMBOLS.IFriendRequestRepository]);

  friendModule
    .bind(DI_SYMBOLS.SendInviteEmailUseCase)
    .toHigherOrderFunction(
      (
        inviteTokenRepo: IInviteTokenRepository,
        emailProvider: IEmailProvider,
      ) =>
        new SendInviteEmailUseCase(
          inviteTokenRepo,
          emailProvider,
          MOBILE_APP_SCHEME,
        ),
      [DI_SYMBOLS.IInviteTokenRepository, DI_SYMBOLS.IEmailProvider],
    );

  return friendModule;
};
