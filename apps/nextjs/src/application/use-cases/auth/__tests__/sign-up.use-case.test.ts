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
import { SignUpUseCase } from "../sign-up.use-case";

describe("SignUpUseCase", () => {
  let useCase: SignUpUseCase;
  let mockUserRepo: IUserRepository;
  let mockAuthProvider: IAuthProvider;

  const email = Email.create("new@example.com").getValue();
  const name = Name.create("New User").getValue();
  const userId = new UUID("user-456");
  const mockUser = User.create(
    { email, name, image: Option.none() },
    userId,
  ).getValue();

  const validInput = {
    email: "new@example.com",
    password: "password123",
    name: "New User",
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    token: "jwt-token-456",
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
    useCase = new SignUpUseCase(mockUserRepo, mockAuthProvider);
  });

  describe("happy path", () => {
    it("should create user and return DTO", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockAuthProvider.signUp).mockResolvedValue(
        Result.ok(mockAuthResponse),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.user.email).toBe("new@example.com");
      expect(output.user.name).toBe("New User");
      expect(output.token).toBe("jwt-token-456");
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith("new@example.com");
      expect(mockAuthProvider.signUp).toHaveBeenCalledOnce();
    });

    it("should create user with optional image", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockAuthProvider.signUp).mockResolvedValue(
        Result.ok(mockAuthResponse),
      );

      const result = await useCase.execute({
        ...validInput,
        image: "https://example.com/avatar.jpg",
      });

      expect(result.isSuccess).toBe(true);
      expect(mockAuthProvider.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          _props: expect.objectContaining({
            image: expect.anything(),
          }),
        }),
        expect.anything(),
      );
    });
  });

  describe("validation errors", () => {
    it("should fail when email format is invalid", async () => {
      const result = await useCase.execute({
        ...validInput,
        email: "invalid-email",
      });

      expect(result.isFailure).toBe(true);
      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });

    it("should fail when name is empty", async () => {
      const result = await useCase.execute({
        ...validInput,
        name: "",
      });

      expect(result.isFailure).toBe(true);
      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });

    it("should fail when password is too short", async () => {
      const result = await useCase.execute({
        ...validInput,
        password: "short",
      });

      expect(result.isFailure).toBe(true);
      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when email is already registered", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.some(mockUser)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Email already registered");
      expect(mockAuthProvider.signUp).not.toHaveBeenCalled();
    });

    it("should fail when findByEmail returns error", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
      expect(mockAuthProvider.signUp).not.toHaveBeenCalled();
    });

    it("should fail when authProvider.signUp fails", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockAuthProvider.signUp).mockResolvedValue(
        Result.fail("Auth service unavailable"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Auth service unavailable");
    });
  });
});
