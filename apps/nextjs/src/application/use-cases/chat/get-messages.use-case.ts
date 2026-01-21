import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IAttachmentDto,
  IGetMessagesInputDto,
  IGetMessagesOutputDto,
  IMessageDto,
  IReactionDto,
} from "@/application/dto/chat/get-messages.dto";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import type { IMessageRepository } from "@/application/ports/message-repository.port";
import { ConversationId } from "@/domain/conversation/conversation-id";
import {
  ConversationNotFoundError,
  UserNotInConversationError,
} from "@/domain/conversation/errors/conversation.errors";
import type { Message } from "@/domain/message/message.entity";
import type { MediaAttachment } from "@/domain/message/value-objects/media-attachment.vo";
import type { Reaction } from "@/domain/message/value-objects/reaction.vo";

export class GetMessagesUseCase
  implements UseCase<IGetMessagesInputDto, IGetMessagesOutputDto>
{
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly messageRepo: IMessageRepository,
  ) {}

  async execute(
    input: IGetMessagesInputDto,
  ): Promise<Result<IGetMessagesOutputDto>> {
    const { conversationId, userId, pagination } = input;

    const validationResult = await this.validateUserAccess(
      conversationId,
      userId,
    );
    if (validationResult.isFailure) {
      return Result.fail(validationResult.getError());
    }

    const messagesResult = await this.messageRepo.findByConversation(
      conversationId,
      pagination,
    );

    if (messagesResult.isFailure) {
      return Result.fail(messagesResult.getError());
    }

    const paginatedResult = messagesResult.getValue();

    return Result.ok({
      messages: paginatedResult.data.map((message) =>
        this.toMessageDto(message),
      ),
      pagination: paginatedResult.pagination,
    });
  }

  private async validateUserAccess(
    conversationId: string,
    userId: string,
  ): Promise<Result<void>> {
    const conversationIdVO = ConversationId.create(new UUID(conversationId));
    const conversationResult =
      await this.conversationRepo.findById(conversationIdVO);

    if (conversationResult.isFailure) {
      return Result.fail(conversationResult.getError());
    }

    return match(conversationResult.getValue(), {
      Some: (conversation) => {
        if (!conversation.isParticipant(userId)) {
          return Result.fail(new UserNotInConversationError().message);
        }
        return Result.ok(undefined);
      },
      None: () => Result.fail(new ConversationNotFoundError().message),
    });
  }

  private toMessageDto(message: Message): IMessageDto {
    return {
      id: message.id.value.toString(),
      conversationId: message.get("conversationId"),
      senderId: message.get("senderId"),
      content: message.get("content").toNull()?.value ?? null,
      attachments: message
        .get("attachments")
        .getItems()
        .map((a: MediaAttachment) => this.toAttachmentDto(a)),
      reactions: message
        .get("reactions")
        .getItems()
        .map((r: Reaction) => this.toReactionDto(r)),
      createdAt: message.get("createdAt"),
      updatedAt: message.get("updatedAt"),
      editedAt: message.get("editedAt").toNull(),
      deletedAt: message.get("deletedAt").toNull(),
    };
  }

  private toAttachmentDto(attachment: MediaAttachment): IAttachmentDto {
    return {
      id: attachment.id,
      url: attachment.url,
      mimeType: attachment.mimeType,
      size: attachment.size,
      filename: attachment.filename,
      dimensions: attachment.dimensions.toNull(),
    };
  }

  private toReactionDto(reaction: Reaction): IReactionDto {
    return {
      userId: reaction.userId,
      emoji: reaction.emoji,
      createdAt: reaction.createdAt,
    };
  }
}
