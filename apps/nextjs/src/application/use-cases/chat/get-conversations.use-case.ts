import { match, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IConversationDto,
  IGetConversationsInputDto,
  IGetConversationsOutputDto,
  IMessagePreviewDto,
  IParticipantDto,
} from "@/application/dto/chat/get-conversations.dto";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import type { Conversation } from "@/domain/conversation/conversation.aggregate";
import type { MessagePreview } from "@/domain/conversation/value-objects/message-preview.vo";
import type { Participant } from "@/domain/conversation/value-objects/participant.vo";

export class GetConversationsUseCase
  implements UseCase<IGetConversationsInputDto, IGetConversationsOutputDto>
{
  constructor(private readonly conversationRepo: IConversationRepository) {}

  async execute(
    input: IGetConversationsInputDto,
  ): Promise<Result<IGetConversationsOutputDto>> {
    const { userId, pagination } = input;

    const conversationsResult = await this.conversationRepo.findAllForUser(
      userId,
      pagination,
    );

    if (conversationsResult.isFailure) {
      return Result.fail(conversationsResult.getError());
    }

    const paginatedResult = conversationsResult.getValue();
    const conversationsWithUnread = await Promise.all(
      paginatedResult.data.map((conversation) =>
        this.toConversationDto(conversation, userId),
      ),
    );

    return Result.ok({
      conversations: conversationsWithUnread,
      pagination: paginatedResult.pagination,
    });
  }

  private async toConversationDto(
    conversation: Conversation,
    userId: string,
  ): Promise<IConversationDto> {
    const unreadCount = await this.calculateUnreadCount(conversation, userId);

    return {
      id: conversation.id.value.toString(),
      participants: conversation
        .get("participants")
        .map((p: Participant) => this.toParticipantDto(p)),
      createdBy: conversation.get("createdBy"),
      lastMessage: match(conversation.get("lastMessage"), {
        Some: (preview: MessagePreview) => this.toMessagePreviewDto(preview),
        None: () => null,
      }),
      unreadCount,
      createdAt: conversation.get("createdAt"),
      updatedAt: conversation.get("updatedAt"),
    };
  }

  private toParticipantDto(participant: Participant): IParticipantDto {
    return {
      userId: participant.userId,
      joinedAt: participant.joinedAt,
      lastReadAt: participant.lastReadAt.toNull(),
    };
  }

  private toMessagePreviewDto(preview: MessagePreview): IMessagePreviewDto {
    return {
      messageId: preview.messageId,
      content: preview.content,
      senderId: preview.senderId,
      sentAt: preview.sentAt,
      hasAttachments: preview.hasAttachments,
    };
  }

  private async calculateUnreadCount(
    conversation: Conversation,
    userId: string,
  ): Promise<number> {
    const participantOption = conversation.getParticipant(userId);

    return match(participantOption, {
      Some: (participant: Participant) => {
        return match(participant.lastReadAt, {
          Some: (_lastReadAt: Date) => {
            return match(conversation.get("lastMessage"), {
              Some: (preview: MessagePreview) => {
                if (preview.sentAt > _lastReadAt) {
                  return 1;
                }
                return 0;
              },
              None: () => 0,
            });
          },
          None: () => {
            return match(conversation.get("lastMessage"), {
              Some: () => 1,
              None: () => 0,
            });
          },
        });
      },
      None: () => 0,
    });
  }
}
