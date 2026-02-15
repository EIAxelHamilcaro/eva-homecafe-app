import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IAuthProvider } from "@/application/ports/auth.service.port";
import { ForgotPasswordUseCase } from "../forgot-password.use-case";

describe("ForgotPasswordUseCase", () => {
  let useCase: ForgotPasswordUseCase;
  let mockAuthProvider: IAuthProvider;

  const validInput = {
    email: "test@example.com",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthProvider = {
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      verifyEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
    } as unknown as IAuthProvider;
    useCase = new ForgotPasswordUseCase(mockAuthProvider);
  });

  describe("happy path", () => {
    it("should request password reset successfully", async () => {
      vi.mocked(mockAuthProvider.requestPasswordReset).mockResolvedValue(
        Result.ok(),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(mockAuthProvider.requestPasswordReset).toHaveBeenCalledWith(
        "test@example.com",
        undefined,
      );
    });

    it("should pass custom redirectTo to auth provider", async () => {
      vi.mocked(mockAuthProvider.requestPasswordReset).mockResolvedValue(
        Result.ok(),
      );

      const result = await useCase.execute({
        ...validInput,
        redirectTo: "/custom-reset",
      });

      expect(result.isSuccess).toBe(true);
      expect(mockAuthProvider.requestPasswordReset).toHaveBeenCalledWith(
        "test@example.com",
        "/custom-reset",
      );
    });
  });

  describe("validation errors", () => {
    it("should fail when email format is invalid", async () => {
      const result = await useCase.execute({
        email: "not-valid-email",
      });

      expect(result.isFailure).toBe(true);
      expect(mockAuthProvider.requestPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when authProvider.requestPasswordReset fails", async () => {
      vi.mocked(mockAuthProvider.requestPasswordReset).mockResolvedValue(
        Result.fail("Email service unavailable"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Email service unavailable");
    });
  });
});
