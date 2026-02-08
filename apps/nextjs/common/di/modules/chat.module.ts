import { createModule } from "@evyweb/ioctopus";
import { DrizzleConversationRepository } from "@/adapters/repositories/conversation.repository";
import { DrizzleMessageRepository } from "@/adapters/repositories/message.repository";
import { AddReactionUseCase } from "@/application/use-cases/chat/add-reaction.use-case";
import { CreateConversationUseCase } from "@/application/use-cases/chat/create-conversation.use-case";
import { GetConversationsUseCase } from "@/application/use-cases/chat/get-conversations.use-case";
import { GetMessagesUseCase } from "@/application/use-cases/chat/get-messages.use-case";
import { MarkConversationReadUseCase } from "@/application/use-cases/chat/mark-conversation-read.use-case";
import { SendMessageUseCase } from "@/application/use-cases/chat/send-message.use-case";
import { UploadMediaUseCase } from "@/application/use-cases/chat/upload-media.use-case";
import { DI_SYMBOLS } from "../types";

export const createChatModule = () => {
  const chatModule = createModule();

  chatModule
    .bind(DI_SYMBOLS.IConversationRepository)
    .toClass(DrizzleConversationRepository);
  chatModule
    .bind(DI_SYMBOLS.IMessageRepository)
    .toClass(DrizzleMessageRepository);

  chatModule
    .bind(DI_SYMBOLS.GetConversationsUseCase)
    .toClass(GetConversationsUseCase, [DI_SYMBOLS.IConversationRepository]);

  chatModule
    .bind(DI_SYMBOLS.CreateConversationUseCase)
    .toClass(CreateConversationUseCase, [DI_SYMBOLS.IConversationRepository]);

  chatModule
    .bind(DI_SYMBOLS.GetMessagesUseCase)
    .toClass(GetMessagesUseCase, [
      DI_SYMBOLS.IConversationRepository,
      DI_SYMBOLS.IMessageRepository,
    ]);

  chatModule
    .bind(DI_SYMBOLS.SendMessageUseCase)
    .toClass(SendMessageUseCase, [
      DI_SYMBOLS.IConversationRepository,
      DI_SYMBOLS.IMessageRepository,
    ]);

  chatModule
    .bind(DI_SYMBOLS.AddReactionUseCase)
    .toClass(AddReactionUseCase, [DI_SYMBOLS.IMessageRepository]);

  chatModule
    .bind(DI_SYMBOLS.MarkConversationReadUseCase)
    .toClass(MarkConversationReadUseCase, [DI_SYMBOLS.IConversationRepository]);

  chatModule
    .bind(DI_SYMBOLS.UploadMediaUseCase)
    .toClass(UploadMediaUseCase, [DI_SYMBOLS.IStorageProvider]);

  return chatModule;
};
