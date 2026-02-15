import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IAuthProvider } from "@/application/ports/auth.service.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";
import { VerifyEmailUseCase } from "../verify-email.use-case";

describe("VerifyEmailUseCase", () => {
  let useCase: VerifyEmailUseCase;
  let mockUserRepo: IUserRepository;
  let mockAuthProvider: IAuthProvider;

  const email = Email.create("test@example.com").getValue();
  const name = Name.create("Test User").getValue();

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
      verifyEmail: vi.fn().mockResolvedValue(Result.ok()),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
    } as unknown as IAuthProvider;
    useCase = new VerifyEmailUseCase(mockUserRepo, mockAuthProvider);
  });

  describe("happy path", () => {
    it("should verify user email and update repo", async () => {
      const mockUser = User.create(
        { email, name, image: Option.none() },
        new UUID("user-123"),
      ).getValue();
      vi.mocked(mockUserRepo.findById).mockResolvedValue(
        Result.ok(Option.some(mockUser)),
      );
      vi.mocked(mockUserRepo.update).mockResolvedValue(Result.ok(mockUser));

      const result = await useCase.execute({ userId: "user-123" });

      expect(result.isSuccess).toBe(true);
      expect(mockUserRepo.update).toHaveBeenCalledOnce();
      expect(mockAuthProvider.verifyEmail).toHaveBeenCalledWith("user-123");
    });
  });

  describe("error handling", () => {
    it("should fail when user is not found", async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({ userId: "unknown-id" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("User not found");
      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when user is already verified", async () => {
      const verifiedUser = User.create(
        { email, name, image: Option.none(), emailVerified: true },
        new UUID("user-123"),
      ).getValue();
      vi.mocked(mockUserRepo.findById).mockResolvedValue(
        Result.ok(Option.some(verifiedUser)),
      );

      const result = await useCase.execute({ userId: "user-123" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("User is already verified");
      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when findById returns error", async () => {
      vi.mocked(mockUserRepo.findById).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({ userId: "user-123" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when update returns error", async () => {
      const mockUser = User.create(
        { email, name, image: Option.none() },
        new UUID("user-123"),
      ).getValue();
      vi.mocked(mockUserRepo.findById).mockResolvedValue(
        Result.ok(Option.some(mockUser)),
      );
      vi.mocked(mockUserRepo.update).mockResolvedValue(
        Result.fail("Update failed"),
      );

      const result = await useCase.execute({ userId: "user-123" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Update failed");
    });
  });
});
