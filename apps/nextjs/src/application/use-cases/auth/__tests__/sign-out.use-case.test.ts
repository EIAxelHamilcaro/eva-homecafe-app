import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AuthSession,
  IAuthProvider,
} from "@/application/ports/auth.service.port";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";
import { SignOutUseCase } from "../sign-out.use-case";

describe("SignOutUseCase", () => {
  let useCase: SignOutUseCase;
  let mockAuthProvider: IAuthProvider;

  const email = Email.create("test@example.com").getValue();
  const name = Name.create("Test User").getValue();
  const userId = new UUID("user-123");
  const mockUser = User.create(
    { email, name, image: Option.none() },
    userId,
  ).getValue();

  const mockAuthSession: AuthSession = {
    user: mockUser,
    session: {
      id: "session-1",
      token: "session-token",
      expiresAt: new Date("2030-01-01"),
    },
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
    useCase = new SignOutUseCase(mockAuthProvider);
  });

  describe("happy path", () => {
    it("should sign out and return session DTO", async () => {
      vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
        Result.ok(Option.some(mockAuthSession)),
      );
      vi.mocked(mockAuthProvider.signOut).mockResolvedValue(Result.ok());

      const result = await useCase.execute(new Headers());

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.user.id).toBe("user-123");
      expect(output.user.email).toBe("test@example.com");
      expect(output.session.id).toBe("session-1");
      expect(mockAuthProvider.signOut).toHaveBeenCalledOnce();
    });
  });

  describe("error handling", () => {
    it("should fail when no active session found", async () => {
      vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(new Headers());

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("No active session found");
      expect(mockAuthProvider.signOut).not.toHaveBeenCalled();
    });

    it("should fail when getSession fails", async () => {
      vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
        Result.fail("Session service error"),
      );

      const result = await useCase.execute(new Headers());

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Session service error");
      expect(mockAuthProvider.signOut).not.toHaveBeenCalled();
    });

    it("should fail when signOut fails", async () => {
      vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
        Result.ok(Option.some(mockAuthSession)),
      );
      vi.mocked(mockAuthProvider.signOut).mockResolvedValue(
        Result.fail("Sign out failed"),
      );

      const result = await useCase.execute(new Headers());

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Sign out failed");
    });
  });
});
