import type { IAuthProvider } from "@/application/ports/auth.service.port";
import type { IBoardRepository } from "@/application/ports/board-repository.port";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type { IEmotionRepository } from "@/application/ports/emotion-repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type { IGalleryRepository } from "@/application/ports/gallery-repository.port";
import type { IInviteTokenRepository } from "@/application/ports/invite-token-repository.port";
import type { IMessageRepository } from "@/application/ports/message-repository.port";
import type { IMoodRepository } from "@/application/ports/mood-repository.port";
import type { IMoodboardRepository } from "@/application/ports/moodboard-repository.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { IPushNotificationProvider } from "@/application/ports/push-notification-provider.port";
import type { IPushTokenRepository } from "@/application/ports/push-token-repository.port";
import type { IRewardRepository } from "@/application/ports/reward-repository.port";
import type { IStorageProvider } from "@/application/ports/storage.provider.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { IUserPreferenceRepository } from "@/application/ports/user-preference-repository.port";
import type { ForgotPasswordUseCase } from "@/application/use-cases/auth/forgot-password.use-case";
import type { GetSessionUseCase } from "@/application/use-cases/auth/get-session.use-case";
import type { ResetPasswordUseCase } from "@/application/use-cases/auth/reset-password.use-case";
import type { SignInUseCase } from "@/application/use-cases/auth/sign-in.use-case";
import type { SignOutUseCase } from "@/application/use-cases/auth/sign-out.use-case";
import type { SignUpUseCase } from "@/application/use-cases/auth/sign-up.use-case";
import type { VerifyEmailUseCase } from "@/application/use-cases/auth/verify-email.use-case";
import type { AddCardToColumnUseCase } from "@/application/use-cases/board/add-card-to-column.use-case";
import type { AddColumnUseCase } from "@/application/use-cases/board/add-column.use-case";
import type { CreateBoardUseCase } from "@/application/use-cases/board/create-board.use-case";
import type { CreateKanbanBoardUseCase } from "@/application/use-cases/board/create-kanban-board.use-case";
import type { DeleteBoardUseCase } from "@/application/use-cases/board/delete-board.use-case";
import type { GetUserBoardsUseCase } from "@/application/use-cases/board/get-user-boards.use-case";
import type { MoveCardUseCase } from "@/application/use-cases/board/move-card.use-case";
import type { RemoveCardUseCase } from "@/application/use-cases/board/remove-card.use-case";
import type { UpdateBoardUseCase } from "@/application/use-cases/board/update-board.use-case";
import type { UpdateCardUseCase } from "@/application/use-cases/board/update-card.use-case";
import type { AddReactionUseCase } from "@/application/use-cases/chat/add-reaction.use-case";
import type { CreateConversationUseCase } from "@/application/use-cases/chat/create-conversation.use-case";
import type { DeleteConversationUseCase } from "@/application/use-cases/chat/delete-conversation.use-case";
import type { GetConversationsUseCase } from "@/application/use-cases/chat/get-conversations.use-case";
import type { GetMessagesUseCase } from "@/application/use-cases/chat/get-messages.use-case";
import type { MarkConversationReadUseCase } from "@/application/use-cases/chat/mark-conversation-read.use-case";
import type { SendMessageUseCase } from "@/application/use-cases/chat/send-message.use-case";
import type { UploadMediaUseCase } from "@/application/use-cases/chat/upload-media.use-case";
import type { SendContactMessageUseCase } from "@/application/use-cases/contact/send-contact-message.use-case";
import type { RecordEmotionUseCase } from "@/application/use-cases/emotion/record-emotion.use-case";
import type { AcceptInviteLinkUseCase } from "@/application/use-cases/friend/accept-invite-link.use-case";
import type { GetFriendsUseCase } from "@/application/use-cases/friend/get-friends.use-case";
import type { GetInviteLinkUseCase } from "@/application/use-cases/friend/get-invite-link.use-case";
import type { GetPendingRequestsUseCase } from "@/application/use-cases/friend/get-pending-requests.use-case";
import type { RemoveFriendUseCase } from "@/application/use-cases/friend/remove-friend.use-case";
import type { RespondFriendRequestUseCase } from "@/application/use-cases/friend/respond-friend-request.use-case";
import type { SendFriendRequestUseCase } from "@/application/use-cases/friend/send-friend-request.use-case";
import type { SendInviteEmailUseCase } from "@/application/use-cases/friend/send-invite-email.use-case";
import type { AddPhotoUseCase } from "@/application/use-cases/gallery/add-photo.use-case";
import type { DeletePhotoUseCase } from "@/application/use-cases/gallery/delete-photo.use-case";
import type { RecordMoodUseCase } from "@/application/use-cases/mood/record-mood.use-case";
import type { AddPinUseCase } from "@/application/use-cases/moodboard/add-pin.use-case";
import type { CreateMoodboardUseCase } from "@/application/use-cases/moodboard/create-moodboard.use-case";
import type { DeleteMoodboardUseCase } from "@/application/use-cases/moodboard/delete-moodboard.use-case";
import type { DeletePinUseCase } from "@/application/use-cases/moodboard/delete-pin.use-case";
import type { GetNotificationsUseCase } from "@/application/use-cases/notification/get-notifications.use-case";
import type { MarkNotificationReadUseCase } from "@/application/use-cases/notification/mark-notification-read.use-case";
import type { SendJournalRemindersUseCase } from "@/application/use-cases/notification/send-journal-reminders.use-case";
import type { CreatePostUseCase } from "@/application/use-cases/post/create-post.use-case";
import type { DeletePostUseCase } from "@/application/use-cases/post/delete-post.use-case";
import type { GetPostDetailUseCase } from "@/application/use-cases/post/get-post-detail.use-case";
import type { GetUserPostsUseCase } from "@/application/use-cases/post/get-user-posts.use-case";
import type { TogglePostReactionUseCase } from "@/application/use-cases/post/toggle-post-reaction.use-case";
import type { UpdatePostUseCase } from "@/application/use-cases/post/update-post.use-case";
import type { CreateProfileUseCase } from "@/application/use-cases/profile/create-profile.use-case";
import type { GetProfileUseCase } from "@/application/use-cases/profile/get-profile.use-case";
import type { UpdateProfileUseCase } from "@/application/use-cases/profile/update-profile.use-case";
import type { RegisterPushTokenUseCase } from "@/application/use-cases/push-token/register-push-token.use-case";
import type { UnregisterPushTokenUseCase } from "@/application/use-cases/push-token/unregister-push-token.use-case";
import type { EvaluateAchievementUseCase } from "@/application/use-cases/reward/evaluate-achievement.use-case";
import type { GenerateUploadUrlUseCase } from "@/application/use-cases/upload/generate-upload-url.use-case";
import type { GetUserPreferencesUseCase } from "@/application/use-cases/user-preference/get-user-preferences.use-case";
import type { UpdateUserPreferencesUseCase } from "@/application/use-cases/user-preference/update-user-preferences.use-case";

export const DI_SYMBOLS = {
  SendContactMessageUseCase: Symbol.for("SendContactMessageUseCase"),
  IUserRepository: Symbol.for("IUserRepository"),
  IAuthProvider: Symbol.for("IAuthProvider"),
  IBoardRepository: Symbol.for("IBoardRepository"),
  IEmailProvider: Symbol.for("IEmailProvider"),
  IEmotionRepository: Symbol.for("IEmotionRepository"),
  IConversationRepository: Symbol.for("IConversationRepository"),
  IEventDispatcher: Symbol.for("IEventDispatcher"),
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
  DeleteConversationUseCase: Symbol.for("DeleteConversationUseCase"),
  MarkConversationReadUseCase: Symbol.for("MarkConversationReadUseCase"),
  UploadMediaUseCase: Symbol.for("UploadMediaUseCase"),
  CreateProfileUseCase: Symbol.for("CreateProfileUseCase"),
  GetProfileUseCase: Symbol.for("GetProfileUseCase"),
  UpdateProfileUseCase: Symbol.for("UpdateProfileUseCase"),
  IFriendRequestRepository: Symbol.for("IFriendRequestRepository"),
  IGalleryRepository: Symbol.for("IGalleryRepository"),
  IInviteTokenRepository: Symbol.for("IInviteTokenRepository"),
  INotificationRepository: Symbol.for("INotificationRepository"),
  SendFriendRequestUseCase: Symbol.for("SendFriendRequestUseCase"),
  SendInviteEmailUseCase: Symbol.for("SendInviteEmailUseCase"),
  RespondFriendRequestUseCase: Symbol.for("RespondFriendRequestUseCase"),
  GetFriendsUseCase: Symbol.for("GetFriendsUseCase"),
  GetPendingRequestsUseCase: Symbol.for("GetPendingRequestsUseCase"),
  GetInviteLinkUseCase: Symbol.for("GetInviteLinkUseCase"),
  AcceptInviteLinkUseCase: Symbol.for("AcceptInviteLinkUseCase"),
  RemoveFriendUseCase: Symbol.for("RemoveFriendUseCase"),
  GetNotificationsUseCase: Symbol.for("GetNotificationsUseCase"),
  MarkNotificationReadUseCase: Symbol.for("MarkNotificationReadUseCase"),
  SendJournalRemindersUseCase: Symbol.for("SendJournalRemindersUseCase"),
  AddCardToColumnUseCase: Symbol.for("AddCardToColumnUseCase"),
  AddColumnUseCase: Symbol.for("AddColumnUseCase"),
  CreateBoardUseCase: Symbol.for("CreateBoardUseCase"),
  CreateKanbanBoardUseCase: Symbol.for("CreateKanbanBoardUseCase"),
  DeleteBoardUseCase: Symbol.for("DeleteBoardUseCase"),
  GetUserBoardsUseCase: Symbol.for("GetUserBoardsUseCase"),
  MoveCardUseCase: Symbol.for("MoveCardUseCase"),
  RemoveCardUseCase: Symbol.for("RemoveCardUseCase"),
  UpdateBoardUseCase: Symbol.for("UpdateBoardUseCase"),
  UpdateCardUseCase: Symbol.for("UpdateCardUseCase"),
  AddPhotoUseCase: Symbol.for("AddPhotoUseCase"),
  DeletePhotoUseCase: Symbol.for("DeletePhotoUseCase"),
  GenerateUploadUrlUseCase: Symbol.for("GenerateUploadUrlUseCase"),
  IMoodRepository: Symbol.for("IMoodRepository"),
  IMoodboardRepository: Symbol.for("IMoodboardRepository"),
  RecordEmotionUseCase: Symbol.for("RecordEmotionUseCase"),
  RecordMoodUseCase: Symbol.for("RecordMoodUseCase"),
  AddPinUseCase: Symbol.for("AddPinUseCase"),
  CreateMoodboardUseCase: Symbol.for("CreateMoodboardUseCase"),
  DeleteMoodboardUseCase: Symbol.for("DeleteMoodboardUseCase"),
  DeletePinUseCase: Symbol.for("DeletePinUseCase"),
  IPostRepository: Symbol.for("IPostRepository"),
  IPushNotificationProvider: Symbol.for("IPushNotificationProvider"),
  IPushTokenRepository: Symbol.for("IPushTokenRepository"),
  IRewardRepository: Symbol.for("IRewardRepository"),
  IUserPreferenceRepository: Symbol.for("IUserPreferenceRepository"),
  CreatePostUseCase: Symbol.for("CreatePostUseCase"),
  RegisterPushTokenUseCase: Symbol.for("RegisterPushTokenUseCase"),
  UnregisterPushTokenUseCase: Symbol.for("UnregisterPushTokenUseCase"),
  EvaluateAchievementUseCase: Symbol.for("EvaluateAchievementUseCase"),
  DeletePostUseCase: Symbol.for("DeletePostUseCase"),
  GetUserPostsUseCase: Symbol.for("GetUserPostsUseCase"),
  GetPostDetailUseCase: Symbol.for("GetPostDetailUseCase"),
  TogglePostReactionUseCase: Symbol.for("TogglePostReactionUseCase"),
  UpdatePostUseCase: Symbol.for("UpdatePostUseCase"),
  GetUserPreferencesUseCase: Symbol.for("GetUserPreferencesUseCase"),
  UpdateUserPreferencesUseCase: Symbol.for("UpdateUserPreferencesUseCase"),
};

export interface DI_RETURN_TYPES {
  SendContactMessageUseCase: SendContactMessageUseCase;
  IUserRepository: IUserRepository;
  IAuthProvider: IAuthProvider;
  IBoardRepository: IBoardRepository;
  IEmailProvider: IEmailProvider;
  IEmotionRepository: IEmotionRepository;
  IConversationRepository: IConversationRepository;
  IEventDispatcher: IEventDispatcher;
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
  DeleteConversationUseCase: DeleteConversationUseCase;
  MarkConversationReadUseCase: MarkConversationReadUseCase;
  UploadMediaUseCase: UploadMediaUseCase;
  CreateProfileUseCase: CreateProfileUseCase;
  GetProfileUseCase: GetProfileUseCase;
  UpdateProfileUseCase: UpdateProfileUseCase;
  IFriendRequestRepository: IFriendRequestRepository;
  IGalleryRepository: IGalleryRepository;
  IInviteTokenRepository: IInviteTokenRepository;
  INotificationRepository: INotificationRepository;
  SendFriendRequestUseCase: SendFriendRequestUseCase;
  SendInviteEmailUseCase: SendInviteEmailUseCase;
  RespondFriendRequestUseCase: RespondFriendRequestUseCase;
  GetFriendsUseCase: GetFriendsUseCase;
  GetPendingRequestsUseCase: GetPendingRequestsUseCase;
  GetInviteLinkUseCase: GetInviteLinkUseCase;
  AcceptInviteLinkUseCase: AcceptInviteLinkUseCase;
  RemoveFriendUseCase: RemoveFriendUseCase;
  GetNotificationsUseCase: GetNotificationsUseCase;
  MarkNotificationReadUseCase: MarkNotificationReadUseCase;
  SendJournalRemindersUseCase: SendJournalRemindersUseCase;
  AddCardToColumnUseCase: AddCardToColumnUseCase;
  AddColumnUseCase: AddColumnUseCase;
  CreateBoardUseCase: CreateBoardUseCase;
  CreateKanbanBoardUseCase: CreateKanbanBoardUseCase;
  DeleteBoardUseCase: DeleteBoardUseCase;
  GetUserBoardsUseCase: GetUserBoardsUseCase;
  MoveCardUseCase: MoveCardUseCase;
  RemoveCardUseCase: RemoveCardUseCase;
  UpdateBoardUseCase: UpdateBoardUseCase;
  UpdateCardUseCase: UpdateCardUseCase;
  AddPhotoUseCase: AddPhotoUseCase;
  DeletePhotoUseCase: DeletePhotoUseCase;
  GenerateUploadUrlUseCase: GenerateUploadUrlUseCase;
  IMoodRepository: IMoodRepository;
  IMoodboardRepository: IMoodboardRepository;
  RecordEmotionUseCase: RecordEmotionUseCase;
  RecordMoodUseCase: RecordMoodUseCase;
  AddPinUseCase: AddPinUseCase;
  CreateMoodboardUseCase: CreateMoodboardUseCase;
  DeleteMoodboardUseCase: DeleteMoodboardUseCase;
  DeletePinUseCase: DeletePinUseCase;
  IPostRepository: IPostRepository;
  IPushNotificationProvider: IPushNotificationProvider;
  IPushTokenRepository: IPushTokenRepository;
  IRewardRepository: IRewardRepository;
  IUserPreferenceRepository: IUserPreferenceRepository;
  CreatePostUseCase: CreatePostUseCase;
  RegisterPushTokenUseCase: RegisterPushTokenUseCase;
  UnregisterPushTokenUseCase: UnregisterPushTokenUseCase;
  EvaluateAchievementUseCase: EvaluateAchievementUseCase;
  DeletePostUseCase: DeletePostUseCase;
  GetUserPostsUseCase: GetUserPostsUseCase;
  GetPostDetailUseCase: GetPostDetailUseCase;
  TogglePostReactionUseCase: TogglePostReactionUseCase;
  UpdatePostUseCase: UpdatePostUseCase;
  GetUserPreferencesUseCase: GetUserPreferencesUseCase;
  UpdateUserPreferencesUseCase: UpdateUserPreferencesUseCase;
}
