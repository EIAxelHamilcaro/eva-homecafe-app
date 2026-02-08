import type { IAuthProvider } from "@/application/ports/auth.service.port";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type { IInviteTokenRepository } from "@/application/ports/invite-token-repository.port";
import type { IMessageRepository } from "@/application/ports/message-repository.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { IStorageProvider } from "@/application/ports/storage.provider.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { ForgotPasswordUseCase } from "@/application/use-cases/auth/forgot-password.use-case";
import type { GetSessionUseCase } from "@/application/use-cases/auth/get-session.use-case";
import type { ResetPasswordUseCase } from "@/application/use-cases/auth/reset-password.use-case";
import type { SignInUseCase } from "@/application/use-cases/auth/sign-in.use-case";
import type { SignOutUseCase } from "@/application/use-cases/auth/sign-out.use-case";
import type { SignUpUseCase } from "@/application/use-cases/auth/sign-up.use-case";
import type { VerifyEmailUseCase } from "@/application/use-cases/auth/verify-email.use-case";
import type { AddReactionUseCase } from "@/application/use-cases/chat/add-reaction.use-case";
import type { CreateConversationUseCase } from "@/application/use-cases/chat/create-conversation.use-case";
import type { GetConversationsUseCase } from "@/application/use-cases/chat/get-conversations.use-case";
import type { GetMessagesUseCase } from "@/application/use-cases/chat/get-messages.use-case";
import type { MarkConversationReadUseCase } from "@/application/use-cases/chat/mark-conversation-read.use-case";
import type { SendMessageUseCase } from "@/application/use-cases/chat/send-message.use-case";
import type { UploadMediaUseCase } from "@/application/use-cases/chat/upload-media.use-case";
import type { AcceptInviteLinkUseCase } from "@/application/use-cases/friend/accept-invite-link.use-case";
import type { GetFriendsUseCase } from "@/application/use-cases/friend/get-friends.use-case";
import type { GetInviteLinkUseCase } from "@/application/use-cases/friend/get-invite-link.use-case";
import type { GetPendingRequestsUseCase } from "@/application/use-cases/friend/get-pending-requests.use-case";
import type { RespondFriendRequestUseCase } from "@/application/use-cases/friend/respond-friend-request.use-case";
import type { SendFriendRequestUseCase } from "@/application/use-cases/friend/send-friend-request.use-case";
import type { GetNotificationsUseCase } from "@/application/use-cases/notification/get-notifications.use-case";
import type { MarkNotificationReadUseCase } from "@/application/use-cases/notification/mark-notification-read.use-case";
import type { CreatePostUseCase } from "@/application/use-cases/post/create-post.use-case";
import type { CreateProfileUseCase } from "@/application/use-cases/profile/create-profile.use-case";
import type { GetProfileUseCase } from "@/application/use-cases/profile/get-profile.use-case";
import type { UpdateProfileUseCase } from "@/application/use-cases/profile/update-profile.use-case";
import type { GenerateUploadUrlUseCase } from "@/application/use-cases/upload/generate-upload-url.use-case";

export const DI_SYMBOLS = {
  IUserRepository: Symbol.for("IUserRepository"),
  IAuthProvider: Symbol.for("IAuthProvider"),
  IEmailProvider: Symbol.for("IEmailProvider"),
  IConversationRepository: Symbol.for("IConversationRepository"),
  IMessageRepository: Symbol.for("IMessageRepository"),
  IProfileRepository: Symbol.for("IProfileRepository"),
  IStorageProvider: Symbol.for("IStorageProvider"),
  SignInUseCase: Symbol.for("SignInUseCase"),
  SignUpUseCase: Symbol.for("SignUpUseCase"),
  SignOutUseCase: Symbol.for("SignOutUseCase"),
  GetSessionUseCase: Symbol.for("GetSessionUseCase"),
  VerifyEmailUseCase: Symbol.for("VerifyEmailUseCase"),
  ForgotPasswordUseCase: Symbol.for("ForgotPasswordUseCase"),
  ResetPasswordUseCase: Symbol.for("ResetPasswordUseCase"),
  GetConversationsUseCase: Symbol.for("GetConversationsUseCase"),
  CreateConversationUseCase: Symbol.for("CreateConversationUseCase"),
  GetMessagesUseCase: Symbol.for("GetMessagesUseCase"),
  SendMessageUseCase: Symbol.for("SendMessageUseCase"),
  AddReactionUseCase: Symbol.for("AddReactionUseCase"),
  MarkConversationReadUseCase: Symbol.for("MarkConversationReadUseCase"),
  UploadMediaUseCase: Symbol.for("UploadMediaUseCase"),
  CreateProfileUseCase: Symbol.for("CreateProfileUseCase"),
  GetProfileUseCase: Symbol.for("GetProfileUseCase"),
  UpdateProfileUseCase: Symbol.for("UpdateProfileUseCase"),
  IFriendRequestRepository: Symbol.for("IFriendRequestRepository"),
  IInviteTokenRepository: Symbol.for("IInviteTokenRepository"),
  INotificationRepository: Symbol.for("INotificationRepository"),
  SendFriendRequestUseCase: Symbol.for("SendFriendRequestUseCase"),
  RespondFriendRequestUseCase: Symbol.for("RespondFriendRequestUseCase"),
  GetFriendsUseCase: Symbol.for("GetFriendsUseCase"),
  GetPendingRequestsUseCase: Symbol.for("GetPendingRequestsUseCase"),
  GetInviteLinkUseCase: Symbol.for("GetInviteLinkUseCase"),
  AcceptInviteLinkUseCase: Symbol.for("AcceptInviteLinkUseCase"),
  GetNotificationsUseCase: Symbol.for("GetNotificationsUseCase"),
  MarkNotificationReadUseCase: Symbol.for("MarkNotificationReadUseCase"),
  GenerateUploadUrlUseCase: Symbol.for("GenerateUploadUrlUseCase"),
  IPostRepository: Symbol.for("IPostRepository"),
  CreatePostUseCase: Symbol.for("CreatePostUseCase"),
};

export interface DI_RETURN_TYPES {
  IUserRepository: IUserRepository;
  IAuthProvider: IAuthProvider;
  IEmailProvider: IEmailProvider;
  IConversationRepository: IConversationRepository;
  IMessageRepository: IMessageRepository;
  IProfileRepository: IProfileRepository;
  IStorageProvider: IStorageProvider;
  SignInUseCase: SignInUseCase;
  SignUpUseCase: SignUpUseCase;
  SignOutUseCase: SignOutUseCase;
  GetSessionUseCase: GetSessionUseCase;
  VerifyEmailUseCase: VerifyEmailUseCase;
  ForgotPasswordUseCase: ForgotPasswordUseCase;
  ResetPasswordUseCase: ResetPasswordUseCase;
  GetConversationsUseCase: GetConversationsUseCase;
  CreateConversationUseCase: CreateConversationUseCase;
  GetMessagesUseCase: GetMessagesUseCase;
  SendMessageUseCase: SendMessageUseCase;
  AddReactionUseCase: AddReactionUseCase;
  MarkConversationReadUseCase: MarkConversationReadUseCase;
  UploadMediaUseCase: UploadMediaUseCase;
  CreateProfileUseCase: CreateProfileUseCase;
  GetProfileUseCase: GetProfileUseCase;
  UpdateProfileUseCase: UpdateProfileUseCase;
  IFriendRequestRepository: IFriendRequestRepository;
  IInviteTokenRepository: IInviteTokenRepository;
  INotificationRepository: INotificationRepository;
  SendFriendRequestUseCase: SendFriendRequestUseCase;
  RespondFriendRequestUseCase: RespondFriendRequestUseCase;
  GetFriendsUseCase: GetFriendsUseCase;
  GetPendingRequestsUseCase: GetPendingRequestsUseCase;
  GetInviteLinkUseCase: GetInviteLinkUseCase;
  AcceptInviteLinkUseCase: AcceptInviteLinkUseCase;
  GetNotificationsUseCase: GetNotificationsUseCase;
  MarkNotificationReadUseCase: MarkNotificationReadUseCase;
  GenerateUploadUrlUseCase: GenerateUploadUrlUseCase;
  IPostRepository: IPostRepository;
  CreatePostUseCase: CreatePostUseCase;
}
