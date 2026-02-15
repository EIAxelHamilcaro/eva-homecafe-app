import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IDeleteConversationInputDto,
  IDeleteConversationOutputDto,
} from "@/application/dto/chat/delete-conversation.dto";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import type { Conversation } from "@/domain/conversation/conversation.aggregate";
import { ConversationId } from "@/domain/conversation/conversation-id";
import { ConversationNotFoundError } from "@/domain/conversation/errors/conversation.errors";

export class DeleteConversationUseCase
  implements UseCase<IDeleteConversationInputDto, IDeleteConversationOutputDto>
{
  constructor(private readonly conversationRepo: IConversationRepository) {}

  async execute(
    input: IDeleteConversationInputDto,
  ): Promise<Result<IDeleteConversationOutputDto>> {
    const { conversationId, userId } = input;

    const conversation = await this.findConversation(conversationId);
    if (conversation.isFailure) {
      return Result.fail(conversation.getError());
    }

    const participantCheck = conversation
      .getValue()
      .validateParticipant(userId);
    if (participantCheck.isFailure) {
      return Result.fail(participantCheck.getError());
    }

    const convId = ConversationId.create(new UUID(conversationId));
    const deleteResult = await this.conversationRepo.delete(convId);
    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.getError());
    }

    return Result.ok({ conversationId });
  }

  private async findConversation(
    conversationId: string,
  ): Promise<Result<Conversation>> {
    const convId = ConversationId.create(new UUID(conversationId));
    const result = await this.conversationRepo.findById(convId);

    if (result.isFailure) {
      return Result.fail(result.getError());
    }

    return match(result.getValue(), {
      Some: (conversation) => Result.ok(conversation),
      None: () => Result.fail(new ConversationNotFoundError().message),
    });
  }
}
