import { Result, type UseCase } from "@packages/ddd-kit";
import type { IForgotPasswordInputDto } from "@/application/dto/forgot-password.dto";
import type { IAuthProvider } from "@/application/ports/auth.service.port";
import { Email } from "@/domain/user/value-objects/email.vo";

export class ForgotPasswordUseCase
  implements UseCase<IForgotPasswordInputDto, void>
{
  constructor(private readonly authProvider: IAuthProvider) {}

  async execute(input: IForgotPasswordInputDto): Promise<Result<void>> {
    const emailResult = Email.create(input.email);
    if (emailResult.isFailure) return Result.fail(emailResult.getError());

    const result = await this.authProvider.requestPasswordReset(
      emailResult.getValue().value,
      input.redirectTo,
    );

    if (result.isFailure) return Result.fail(result.getError());

    return Result.ok();
  }
}
