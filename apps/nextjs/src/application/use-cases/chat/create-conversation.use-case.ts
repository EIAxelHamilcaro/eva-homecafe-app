import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  ICreateConversationInputDto,
  ICreateConversationOutputDto,
} from "@/application/dto/chat/create-conversation.dto";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import { Conversation } from "@/domain/conversation/conversation.aggregate";
import { Participant } from "@/domain/conversation/value-objects/participant.vo";

export class CreateConversationUseCase
  implements UseCase<ICreateConversationInputDto, ICreateConversationOutputDto>
{
  constructor(private readonly conversationRepo: IConversationRepository) {}

  async execute(
    input: ICreateConversationInputDto,
  ): Promise<Result<ICreateConversationOutputDto>> {
    const { userId, recipientId } = input;

    if (userId === recipientId) {
      return Result.fail("Cannot create conversation with yourself");
    }

    const participantIds = [userId, recipientId].sort();
    const existingResult =
      await this.conversationRepo.findByParticipants(participantIds);

    if (existingResult.isFailure) {
      return Result.fail(existingResult.getError());
    }

    const existingOption = existingResult.getValue();

    if (existingOption.isSome()) {
      const conversation = existingOption.unwrap();
      return Result.ok({
        conversationId: conversation.id.value.toString(),
        isNew: false,
      });
    }

    return this.createNewConversation(userId, participantIds);
  }

  private async createNewConversation(
    createdBy: string,
    participantIds: string[],
  ): Promise<Result<ICreateConversationOutputDto>> {
    const participantResults = participantIds.map((id) =>
      Participant.createNew(id),
    );
    const combinedResult = Result.combine(participantResults);

    if (combinedResult.isFailure) {
      return Result.fail(combinedResult.getError());
    }

    const participants = participantResults.map((r) => r.getValue());

    const conversationResult = Conversation.create({
      participants,
      createdBy,
    });

    if (conversationResult.isFailure) {
      return Result.fail(conversationResult.getError());
    }

    const conversation = conversationResult.getValue();
    const saveResult = await this.conversationRepo.create(conversation);

    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok({
      conversationId: conversation.id.value.toString(),
      isNew: true,
    });
  }
}
