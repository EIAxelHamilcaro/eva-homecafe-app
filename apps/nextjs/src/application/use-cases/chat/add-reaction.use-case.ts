import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IAddReactionInputDto,
  IAddReactionOutputDto,
} from "@/application/dto/chat/add-reaction.dto";
import type { IMessageRepository } from "@/application/ports/message-repository.port";
import { MessageNotFoundError } from "@/domain/message/errors/message.errors";
import type { Message } from "@/domain/message/message.entity";
import { MessageId } from "@/domain/message/message-id";
import type { ReactionEmoji } from "@/domain/message/value-objects/reaction-type.vo";

export class AddReactionUseCase
  implements UseCase<IAddReactionInputDto, IAddReactionOutputDto>
{
  constructor(private readonly messageRepo: IMessageRepository) {}

  async execute(
    input: IAddReactionInputDto,
  ): Promise<Result<IAddReactionOutputDto>> {
    const { messageId, userId, emoji } = input;

    const messageResult = await this.findMessage(messageId);
    if (messageResult.isFailure) {
      return Result.fail(messageResult.getError());
    }
    const message = messageResult.getValue();

    const action = this.toggleReaction(message, userId, emoji as ReactionEmoji);
    if (action.isFailure) {
      return Result.fail(action.getError());
    }

    const updateResult = await this.messageRepo.update(message);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
    }

    return Result.ok({
      messageId,
      userId,
      emoji: emoji as ReactionEmoji,
      action: action.getValue(),
    });
  }

  private async findMessage(messageId: string): Promise<Result<Message>> {
    const messageIdVO = MessageId.create(new UUID(messageId));
    const messageResult = await this.messageRepo.findById(messageIdVO);

    if (messageResult.isFailure) {
      return Result.fail(messageResult.getError());
    }

    return match(messageResult.getValue(), {
      Some: (message) => Result.ok(message),
      None: () => Result.fail(new MessageNotFoundError().message),
    });
  }

  private toggleReaction(
    message: Message,
    userId: string,
    emoji: ReactionEmoji,
  ): Result<"added" | "removed"> {
    const reactions = message.get("reactions");
    const hasReaction = reactions.hasUserReactedWith(userId, emoji);

    if (hasReaction) {
      const removeResult = message.removeReaction(userId, emoji);
      if (removeResult.isFailure) {
        return Result.fail(removeResult.getError());
      }
      return Result.ok("removed");
    }

    const addResult = message.addReaction(userId, emoji);
    if (addResult.isFailure) {
      return Result.fail(addResult.getError());
    }
    return Result.ok("added");
  }
}
