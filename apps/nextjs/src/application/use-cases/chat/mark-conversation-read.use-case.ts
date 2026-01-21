import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IMarkConversationReadInputDto,
  IMarkConversationReadOutputDto,
} from "@/application/dto/chat/mark-conversation-read.dto";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import type { Conversation } from "@/domain/conversation/conversation.aggregate";
import { ConversationId } from "@/domain/conversation/conversation-id";
import { ConversationNotFoundError } from "@/domain/conversation/errors/conversation.errors";

export class MarkConversationReadUseCase
  implements
    UseCase<IMarkConversationReadInputDto, IMarkConversationReadOutputDto>
{
  constructor(private readonly conversationRepo: IConversationRepository) {}

  async execute(
    input: IMarkConversationReadInputDto,
  ): Promise<Result<IMarkConversationReadOutputDto>> {
    const { conversationId, userId } = input;

    const conversationResult = await this.findConversation(conversationId);
    if (conversationResult.isFailure) {
      return Result.fail(conversationResult.getError());
    }
    const conversation = conversationResult.getValue();

    const markResult = conversation.markAsRead(userId);
    if (markResult.isFailure) {
      return Result.fail(markResult.getError());
    }

    const updateResult = await this.conversationRepo.update(conversation);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    const readAt = new Date();

    return Result.ok({
      conversationId,
      userId,
      readAt,
    });
  }

  private async findConversation(
    conversationId: string,
  ): Promise<Result<Conversation>> {
    const conversationIdVO = ConversationId.create(new UUID(conversationId));
    const conversationResult =
      await this.conversationRepo.findById(conversationIdVO);

    if (conversationResult.isFailure) {
      return Result.fail(conversationResult.getError());
    }

    return match(conversationResult.getValue(), {
      Some: (conversation) => Result.ok(conversation),
      None: () => Result.fail(new ConversationNotFoundError().message),
    });
  }
}
