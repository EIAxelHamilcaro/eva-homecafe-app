import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ICreateProfileInputDto } from "@/application/dto/profile/create-profile.dto";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import type { Profile } from "@/domain/profile/profile.aggregate";
import { CreateProfileUseCase } from "../create-profile.use-case";

describe("CreateProfileUseCase", () => {
  let useCase: CreateProfileUseCase;
  let mockProfileRepo: IProfileRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockProfileRepo = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
      existsByUserId: vi.fn(),
    } as unknown as IProfileRepository;
    useCase = new CreateProfileUseCase(mockProfileRepo);
  });

  describe("happy path", () => {
    it("should create a profile when user has no existing profile", async () => {
      const input: ICreateProfileInputDto = {
        userId: "user-123",
        displayName: "John Doe",
        bio: "Hello world",
        avatarUrl: "https://example.com/avatar.jpg",
      };

      vi.mocked(mockProfileRepo.existsByUserId).mockResolvedValue(
        Result.ok(false),
      );
      vi.mocked(mockProfileRepo.create).mockResolvedValue(
        Result.ok({} as Profile),
      );

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      expect(mockProfileRepo.existsByUserId).toHaveBeenCalledWith("user-123");
      expect(mockProfileRepo.create).toHaveBeenCalledOnce();

      const output = result.getValue();
      expect(output.userId).toBe("user-123");
      expect(output.displayName).toBe("John Doe");
      expect(output.bio).toBe("Hello world");
      expect(output.avatarUrl).toBe("https://example.com/avatar.jpg");
    });

    it("should create a profile without bio", async () => {
      const input: ICreateProfileInputDto = {
        userId: "user-123",
        displayName: "John Doe",
      };

      vi.mocked(mockProfileRepo.existsByUserId).mockResolvedValue(
        Result.ok(false),
      );
      vi.mocked(mockProfileRepo.create).mockResolvedValue(
        Result.ok({} as Profile),
      );

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.bio).toBeNull();
    });

    it("should create a profile without avatarUrl", async () => {
      const input: ICreateProfileInputDto = {
        userId: "user-123",
        displayName: "John Doe",
        bio: "Hello",
      };

      vi.mocked(mockProfileRepo.existsByUserId).mockResolvedValue(
        Result.ok(false),
      );
      vi.mocked(mockProfileRepo.create).mockResolvedValue(
        Result.ok({} as Profile),
      );

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.avatarUrl).toBeNull();
    });
  });

  describe("validation errors", () => {
    it("should fail when display name is empty", async () => {
      const input: ICreateProfileInputDto = {
        userId: "user-123",
        displayName: "",
      };

      vi.mocked(mockProfileRepo.existsByUserId).mockResolvedValue(
        Result.ok(false),
      );

      const result = await useCase.execute(input);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("required");
    });

    it("should fail when display name exceeds 50 characters", async () => {
      const input: ICreateProfileInputDto = {
        userId: "user-123",
        displayName: "a".repeat(51),
      };

      vi.mocked(mockProfileRepo.existsByUserId).mockResolvedValue(
        Result.ok(false),
      );

      const result = await useCase.execute(input);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("50");
    });

    it("should fail when bio exceeds 500 characters", async () => {
      const input: ICreateProfileInputDto = {
        userId: "user-123",
        displayName: "John Doe",
        bio: "a".repeat(501),
      };

      vi.mocked(mockProfileRepo.existsByUserId).mockResolvedValue(
        Result.ok(false),
      );

      const result = await useCase.execute(input);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("500");
    });
  });

  describe("business rule errors", () => {
    it("should fail when profile already exists for user", async () => {
      const input: ICreateProfileInputDto = {
        userId: "user-123",
        displayName: "John Doe",
      };

      vi.mocked(mockProfileRepo.existsByUserId).mockResolvedValue(
        Result.ok(true),
      );

      const result = await useCase.execute(input);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("already exists");
      expect(mockProfileRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when existsByUserId returns error", async () => {
      const input: ICreateProfileInputDto = {
        userId: "user-123",
        displayName: "John Doe",
      };

      vi.mocked(mockProfileRepo.existsByUserId).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(input);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when create returns error", async () => {
      const input: ICreateProfileInputDto = {
        userId: "user-123",
        displayName: "John Doe",
      };

      vi.mocked(mockProfileRepo.existsByUserId).mockResolvedValue(
        Result.ok(false),
      );
      vi.mocked(mockProfileRepo.create).mockResolvedValue(
        Result.fail("Save failed"),
      );

      const result = await useCase.execute(input);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Save failed");
    });
  });
});
