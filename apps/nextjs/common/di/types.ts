import type { IAuthProvider } from "@/application/ports/auth.service.port";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import type { IEmailProvider } from "@/application/ports/email.provider.port";
import type { IMessageRepository } from "@/application/ports/message-repository.port";
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

export const DI_SYMBOLS = {
  IUserRepository: Symbol.for("IUserRepository"),
  IAuthProvider: Symbol.for("IAuthProvider"),
  IEmailProvider: Symbol.for("IEmailProvider"),
  IConversationRepository: Symbol.for("IConversationRepository"),
  IMessageRepository: Symbol.for("IMessageRepository"),
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
};

export interface DI_RETURN_TYPES {
  IUserRepository: IUserRepository;
  IAuthProvider: IAuthProvider;
  IEmailProvider: IEmailProvider;
  IConversationRepository: IConversationRepository;
  IMessageRepository: IMessageRepository;
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
}
