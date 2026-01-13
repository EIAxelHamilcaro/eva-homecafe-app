import { createModule } from "@evyweb/ioctopus";
import { DrizzleUserRepository } from "@/adapters/repositories/user.repository";
import { BetterAuthService } from "@/adapters/services/better-auth.service";
import { ResendService } from "@/adapters/services/email/resend.service";
import { ForgotPasswordUseCase } from "@/application/use-cases/auth/forgot-password.use-case";
import { GetSessionUseCase } from "@/application/use-cases/auth/get-session.use-case";
import { ResetPasswordUseCase } from "@/application/use-cases/auth/reset-password.use-case";
import { SignInUseCase } from "@/application/use-cases/auth/sign-in.use-case";
import { SignOutUseCase } from "@/application/use-cases/auth/sign-out.use-case";
import { SignUpUseCase } from "@/application/use-cases/auth/sign-up.use-case";
import { VerifyEmailUseCase } from "@/application/use-cases/auth/verify-email.use-case";
import { DI_SYMBOLS } from "../types";

export const createAuthModule = () => {
  const authModule = createModule();

  authModule.bind(DI_SYMBOLS.IUserRepository).toClass(DrizzleUserRepository);
  authModule.bind(DI_SYMBOLS.IAuthProvider).toClass(BetterAuthService);
  authModule.bind(DI_SYMBOLS.IEmailProvider).toClass(ResendService);

  authModule
    .bind(DI_SYMBOLS.SignInUseCase)
    .toClass(SignInUseCase, [
      DI_SYMBOLS.IUserRepository,
      DI_SYMBOLS.IAuthProvider,
    ]);

  authModule
    .bind(DI_SYMBOLS.SignUpUseCase)
    .toClass(SignUpUseCase, [
      DI_SYMBOLS.IUserRepository,
      DI_SYMBOLS.IAuthProvider,
    ]);

  authModule
    .bind(DI_SYMBOLS.SignOutUseCase)
    .toClass(SignOutUseCase, [DI_SYMBOLS.IAuthProvider]);

  authModule
    .bind(DI_SYMBOLS.GetSessionUseCase)
    .toClass(GetSessionUseCase, [DI_SYMBOLS.IAuthProvider]);

  authModule
    .bind(DI_SYMBOLS.VerifyEmailUseCase)
    .toClass(VerifyEmailUseCase, [
      DI_SYMBOLS.IUserRepository,
      DI_SYMBOLS.IAuthProvider,
    ]);

  authModule
    .bind(DI_SYMBOLS.ForgotPasswordUseCase)
    .toClass(ForgotPasswordUseCase, [DI_SYMBOLS.IAuthProvider]);

  authModule
    .bind(DI_SYMBOLS.ResetPasswordUseCase)
    .toClass(ResetPasswordUseCase, [DI_SYMBOLS.IAuthProvider]);

  return authModule;
};
