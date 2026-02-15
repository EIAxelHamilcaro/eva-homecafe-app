import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IAuthProvider } from "@/application/ports/auth.service.port";
import { ResetPasswordUseCase } from "../reset-password.use-case";

describe("ResetPasswordUseCase", () => {
  let useCase: ResetPasswordUseCase;
  let mockAuthProvider: IAuthProvider;

  const validInput = {
    token: "reset-token-abc",
    password: "newPassword123",
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
    useCase = new ResetPasswordUseCase(mockAuthProvider);
  });

  describe("happy path", () => {
    it("should reset password successfully", async () => {
      vi.mocked(mockAuthProvider.resetPassword).mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(mockAuthProvider.resetPassword).toHaveBeenCalledWith(
        "reset-token-abc",
        "newPassword123",
      );
    });
  });

  describe("validation errors", () => {
    it("should fail when password is too short", async () => {
      const result = await useCase.execute({
        ...validInput,
        password: "short",
      });

      expect(result.isFailure).toBe(true);
      expect(mockAuthProvider.resetPassword).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when authProvider.resetPassword fails", async () => {
      vi.mocked(mockAuthProvider.resetPassword).mockResolvedValue(
        Result.fail("Invalid or expired token"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Invalid or expired token");
    });
  });
});
