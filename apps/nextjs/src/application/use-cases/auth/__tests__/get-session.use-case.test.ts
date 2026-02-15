import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AuthSession,
  IAuthProvider,
} from "@/application/ports/auth.service.port";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";
import { GetSessionUseCase } from "../get-session.use-case";

describe("GetSessionUseCase", () => {
  let useCase: GetSessionUseCase;
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
    useCase = new GetSessionUseCase(mockAuthProvider);
  });

  describe("happy path", () => {
    it("should return Some(session DTO) when session exists", async () => {
      vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
        Result.ok(Option.some(mockAuthSession)),
      );

      const result = await useCase.execute(new Headers());

      expect(result.isSuccess).toBe(true);
      const option = result.getValue();
      expect(option.isSome()).toBe(true);
      const session = option.unwrap();
      expect(session.user.id).toBe("user-123");
      expect(session.user.email).toBe("test@example.com");
      expect(session.session.id).toBe("session-1");
      expect(session.session.token).toBe("session-token");
    });

    it("should return None when no session exists", async () => {
      vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(new Headers());

      expect(result.isSuccess).toBe(true);
      const option = result.getValue();
      expect(option.isNone()).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should fail when authProvider.getSession fails", async () => {
      vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
        Result.fail("Session service unavailable"),
      );

      const result = await useCase.execute(new Headers());

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Session service unavailable");
    });
  });
});
