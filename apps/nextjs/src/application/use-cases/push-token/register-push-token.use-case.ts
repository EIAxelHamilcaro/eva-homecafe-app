import { match, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IRegisterPushTokenInputDto,
  IRegisterPushTokenOutputDto,
} from "@/application/dto/push-token/register-push-token.dto";
import type { IPushTokenRepository } from "@/application/ports/push-token-repository.port";
import { PushToken } from "@/domain/push-token/push-token.aggregate";

export class RegisterPushTokenUseCase
  implements
    UseCase<
      IRegisterPushTokenInputDto & { userId: string },
      IRegisterPushTokenOutputDto
    >
{
  constructor(private readonly pushTokenRepo: IPushTokenRepository) {}

  async execute(
    input: IRegisterPushTokenInputDto & { userId: string },
  ): Promise<Result<IRegisterPushTokenOutputDto>> {
    const existingResult = await this.pushTokenRepo.findByToken(input.token);
    if (existingResult.isFailure) {
      return Result.fail(existingResult.getError());
    }

    const existingAction = await match(existingResult.getValue(), {
      Some: async (existing) => {
        if (existing.get("userId") === input.userId) {
          return Result.ok({ id: existing.id.value.toString() });
        }

        const deleteResult = await this.pushTokenRepo.deleteByToken(
          input.token,
        );
        if (deleteResult.isFailure) {
          return Result.fail<IRegisterPushTokenOutputDto>(
            deleteResult.getError(),
          );
        }
        return null;
      },
      None: async () => null,
    });

    if (existingAction) {
      return existingAction;
    }

    const pushToken = PushToken.create({
      userId: input.userId,
      token: input.token,
      platform: input.platform,
    });

    const saveResult = await this.pushTokenRepo.create(pushToken);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    return Result.ok({ id: pushToken.id.value.toString() });
  }
}
