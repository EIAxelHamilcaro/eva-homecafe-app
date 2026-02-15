import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AuthResponse,
  IAuthProvider,
} from "@/application/ports/auth.service.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";
import { SignInUseCase } from "../sign-in.use-case";

describe("SignInUseCase", () => {
  let useCase: SignInUseCase;
  let mockUserRepo: IUserRepository;
  let mockAuthProvider: IAuthProvider;

  const email = Email.create("test@example.com" as string).getValue();
  const name = Name.create("Test User" as string).getValue();
  const userId = new UUID("user-123");
  const mockUser = User.create(
    { email, name, image: Option.none() },
    userId,
  ).getValue();

  const validInput = {
    email: "test@example.com",
    password: "password123",
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    token: "jwt-token-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserRepo = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
    } as unknown as IUserRepository;
    mockAuthProvider = {
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      verifyEmail: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
    } as unknown as IAuthProvider;
    useCase = new SignInUseCase(mockUserRepo, mockAuthProvider);
  });

  describe("happy path", () => {
    it("should sign in and return user + token DTO", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.some(mockUser)),
      );
      vi.mocked(mockAuthProvider.signIn).mockResolvedValue(
        Result.ok(mockAuthResponse),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.user.email).toBe("test@example.com");
      expect(output.user.name).toBe("Test User");
      expect(output.user.id).toBe("user-123");
      expect(output.token).toBe("jwt-token-123");
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(mockAuthProvider.signIn).toHaveBeenCalledOnce();
    });

    it("should pass rememberMe flag to auth provider", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.some(mockUser)),
      );
      vi.mocked(mockAuthProvider.signIn).mockResolvedValue(
        Result.ok(mockAuthResponse),
      );

      await useCase.execute({ ...validInput, rememberMe: true });

      expect(mockAuthProvider.signIn).toHaveBeenCalledWith(
        mockUser,
        expect.anything(),
        true,
      );
    });
  });

  describe("validation errors", () => {
    it("should fail when email format is invalid", async () => {
      const result = await useCase.execute({
        ...validInput,
        email: "not-an-email",
      });

      expect(result.isFailure).toBe(true);
      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });

    it("should fail when password is empty", async () => {
      const result = await useCase.execute({
        ...validInput,
        password: "",
      });

      expect(result.isFailure).toBe(true);
      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when user is not found", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Email not found");
      expect(mockAuthProvider.signIn).not.toHaveBeenCalled();
    });

    it("should fail when findByEmail returns error", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
      expect(mockAuthProvider.signIn).not.toHaveBeenCalled();
    });

    it("should fail when authProvider.signIn fails", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.some(mockUser)),
      );
      vi.mocked(mockAuthProvider.signIn).mockResolvedValue(
        Result.fail("Invalid credentials"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Invalid credentials");
    });
  });
});
