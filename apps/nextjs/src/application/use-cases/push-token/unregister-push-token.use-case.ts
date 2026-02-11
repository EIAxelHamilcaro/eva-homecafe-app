import { match, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IUnregisterPushTokenInputDto,
  IUnregisterPushTokenOutputDto,
} from "@/application/dto/push-token/unregister-push-token.dto";
import type { IPushTokenRepository } from "@/application/ports/push-token-repository.port";

export class UnregisterPushTokenUseCase
  implements
    UseCase<
      IUnregisterPushTokenInputDto & { userId: string },
      IUnregisterPushTokenOutputDto
    >
{
  constructor(private readonly pushTokenRepo: IPushTokenRepository) {}

  async execute(
    input: IUnregisterPushTokenInputDto & { userId: string },
  ): Promise<Result<IUnregisterPushTokenOutputDto>> {
    const tokenResult = await this.pushTokenRepo.findByToken(input.token);
    if (tokenResult.isFailure) {
      return Result.fail(tokenResult.getError());
    }

    const ownershipCheck = match(tokenResult.getValue(), {
      Some: (existing) => {
        if (existing.get("userId") !== input.userId) {
          return Result.fail<void>("Token does not belong to user");
        }
        return null;
      },
      None: () => null,
    });

    if (ownershipCheck?.isFailure) {
      return Result.fail(ownershipCheck.getError());
    }

    const deleteResult = await this.pushTokenRepo.deleteByToken(input.token);
    if (deleteResult.isFailure) {
      return Result.fail(deleteResult.getError());
    }

    return Result.ok({ success: true });
  }
}
