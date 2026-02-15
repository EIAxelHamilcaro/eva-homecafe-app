import { match, Option, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IAttachmentInput,
  ISendMessageInputDto,
  ISendMessageOutputDto,
} from "@/application/dto/chat/send-message.dto";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IMessageRepository } from "@/application/ports/message-repository.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type { Conversation } from "@/domain/conversation/conversation.aggregate";
import { ConversationId } from "@/domain/conversation/conversation-id";
import {
  ConversationNotFoundError,
  UserNotInConversationError,
} from "@/domain/conversation/errors/conversation.errors";
import { MessagePreview } from "@/domain/conversation/value-objects/message-preview.vo";
import { EmptyMessageError } from "@/domain/message/errors/message.errors";
import { Message } from "@/domain/message/message.entity";
import {
  type AllowedMimeType,
  MediaAttachment,
} from "@/domain/message/value-objects/media-attachment.vo";
import { MessageContent } from "@/domain/message/value-objects/message-content.vo";
import { Notification } from "@/domain/notification/notification.aggregate";
import { NotificationType } from "@/domain/notification/value-objects/notification-type.vo";

export class SendMessageUseCase
  implements UseCase<ISendMessageInputDto, ISendMessageOutputDto>
{
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly messageRepo: IMessageRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: ISendMessageInputDto,
  ): Promise<Result<ISendMessageOutputDto>> {
    const { conversationId, senderId, content, attachments } = input;

    if (!content && (!attachments || attachments.length === 0)) {
      return Result.fail(new EmptyMessageError().message);
    }

    const conversationResult = await this.validateAndGetConversation(
      conversationId,
      senderId,
    );
    if (conversationResult.isFailure) {
      return Result.fail(conversationResult.getError());
    }
    const conversation = conversationResult.getValue();

    const contentOption = this.createContentOption(content);
    if (contentOption.isFailure) {
      return Result.fail(contentOption.getError());
    }

    const attachmentsResult = this.createAttachments(attachments ?? []);
    if (attachmentsResult.isFailure) {
      return Result.fail(attachmentsResult.getError());
    }

    const messageResult = Message.create({
      conversationId,
      senderId,
      content: contentOption.getValue(),
      attachments: attachmentsResult.getValue(),
    });

    if (messageResult.isFailure) {
      return Result.fail(messageResult.getError());
    }

    const message = messageResult.getValue();

    const saveResult = await this.messageRepo.create(message);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    const previewResult = MessagePreview.fromMessage(
      message.id.value.toString(),
      contentOption
        .getValue()
        .map((c) => c.value)
        .unwrapOr(""),
      senderId,
      message.get("createdAt"),
      attachmentsResult.getValue().length > 0,
    );

    if (previewResult.isSuccess) {
      conversation.updateLastMessage(previewResult.getValue());
      await this.conversationRepo.update(conversation);
    }

    await this.notifyOtherParticipants(conversation, senderId, content);

    return Result.ok(this.toDto(message, attachments ?? []));
  }

  private async notifyOtherParticipants(
    conversation: Conversation,
    senderId: string,
    content?: string,
  ): Promise<void> {
    try {
      const typeResult = NotificationType.createNewMessage();
      if (typeResult.isFailure) return;

      const otherParticipants = conversation.getOtherParticipants(senderId);
      const preview = content
        ? content.length > 50
          ? `${content.substring(0, 50)}...`
          : content
        : "Pièce jointe";

      for (const participant of otherParticipants) {
        const notificationResult = Notification.create({
          userId: participant.userId,
          type: typeResult.getValue(),
          title: "Nouveau message",
          body: preview,
          data: {
            conversationId: conversation.id.value.toString(),
            senderId,
          },
        });
        if (notificationResult.isFailure) continue;

        const notification = notificationResult.getValue();
        await this.notificationRepo.create(notification);
        await this.eventDispatcher.dispatchAll(notification.domainEvents);
        notification.clearEvents();
      }
    } catch {}
  }

  private async validateAndGetConversation(
    conversationId: string,
    userId: string,
  ): Promise<
    Result<
      ReturnType<typeof this.conversationRepo.findById> extends Promise<
        Result<infer T>
      >
        ? T extends Option<infer C>
          ? C
          : never
        : never
    >
  > {
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
        return Result.ok(conversation);
      },
      None: () => Result.fail(new ConversationNotFoundError().message),
    });
  }

  private createContentOption(
    content?: string,
  ): Result<Option<MessageContent>> {
    if (!content) {
      return Result.ok(Option.none());
    }

    const contentResult = MessageContent.create(content);
    if (contentResult.isFailure) {
      return Result.fail(contentResult.getError());
    }

    return Result.ok(Option.some(contentResult.getValue()));
  }

  private createAttachments(
    attachments: IAttachmentInput[],
  ): Result<MediaAttachment[]> {
    const results: MediaAttachment[] = [];

    for (const attachment of attachments) {
      const attachmentResult = MediaAttachment.create({
        id: attachment.id,
        url: attachment.url,
        mimeType: attachment.mimeType as AllowedMimeType,
        size: attachment.size,
        filename: attachment.filename,
        dimensions: attachment.dimensions ?? undefined,
      });

      if (attachmentResult.isFailure) {
        return Result.fail(attachmentResult.getError());
      }

      results.push(attachmentResult.getValue());
    }

    return Result.ok(results);
  }

  private toDto(
    message: Message,
    attachments: IAttachmentInput[],
  ): ISendMessageOutputDto {
    return {
      messageId: message.id.value.toString(),
      conversationId: message.get("conversationId"),
      senderId: message.get("senderId"),
      content: message.get("content").toNull()?.value ?? null,
      attachments: attachments.map((a) => ({
        id: a.id,
        url: a.url,
        mimeType: a.mimeType,
        size: a.size,
        filename: a.filename,
        dimensions: a.dimensions,
      })),
      createdAt: message.get("createdAt"),
    };
  }
}
