import { Result, type UseCase } from "@packages/ddd-kit";
import type { IResetPasswordInputDto } from "@/application/dto/reset-password.dto";
import type { IAuthProvider } from "@/application/ports/auth.service.port";
import { Password } from "@/domain/user/value-objects/password.vo";

export class ResetPasswordUseCase
  implements UseCase<IResetPasswordInputDto, void>
{
  constructor(private readonly authProvider: IAuthProvider) {}

  async execute(input: IResetPasswordInputDto): Promise<Result<void>> {
    const passwordResult = Password.create(input.password);
    if (passwordResult.isFailure) return Result.fail(passwordResult.getError());

    const result = await this.authProvider.resetPassword(
      input.token,
      passwordResult.getValue().value,
    );

    if (result.isFailure) return Result.fail(result.getError());

    return Result.ok();
  }
}
