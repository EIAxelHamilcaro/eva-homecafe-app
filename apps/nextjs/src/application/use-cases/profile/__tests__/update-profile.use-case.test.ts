import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IUpdateProfileInputDto } from "@/application/dto/profile/update-profile.dto";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import { Profile } from "@/domain/profile/profile.aggregate";
import { ProfileId } from "@/domain/profile/profile-id";
import { Bio } from "@/domain/profile/value-objects/bio.vo";
import { DisplayName } from "@/domain/profile/value-objects/display-name.vo";
import { UpdateProfileUseCase } from "../update-profile.use-case";

describe("UpdateProfileUseCase", () => {
  let useCase: UpdateProfileUseCase;
  let mockProfileRepo: IProfileRepository;

  const createMockProfile = (
    userId: string,
    displayName: string,
    bio?: string,
    avatarUrl?: string,
  ): Profile => {
    const displayNameVO = DisplayName.create(displayName).getValue();
    const bioOption = bio
      ? Option.some(Bio.create(bio).getValue())
      : Option.none<Bio>();
    const avatarOption = Option.fromNullable(avatarUrl ?? null);

    return Profile.reconstitute(
      {
        userId,
        displayName: displayNameVO,
        bio: bioOption,
        avatarUrl: avatarOption,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      ProfileId.create(new UUID("profile-123")),
    );
  };

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
    useCase = new UpdateProfileUseCase(mockProfileRepo);
  });

  describe("happy path", () => {
    it("should update display name", async () => {
      const input: IUpdateProfileInputDto = {
        userId: "user-123",
        displayName: "New Name",
      };

      const mockProfile = createMockProfile("user-123", "Old Name");

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(mockProfile)),
      );
      vi.mocked(mockProfileRepo.update).mockResolvedValue(
        Result.ok(mockProfile),
      );

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      expect(mockProfileRepo.findByUserId).toHaveBeenCalledWith("user-123");
      expect(mockProfileRepo.update).toHaveBeenCalledOnce();

      const output = result.getValue();
      expect(output.displayName).toBe("New Name");
    });

    it("should update bio", async () => {
      const input: IUpdateProfileInputDto = {
        userId: "user-123",
        bio: "New bio content",
      };

      const mockProfile = createMockProfile("user-123", "John Doe", "Old bio");

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(mockProfile)),
      );
      vi.mocked(mockProfileRepo.update).mockResolvedValue(
        Result.ok(mockProfile),
      );

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.bio).toBe("New bio content");
    });

    it("should clear bio when set to null", async () => {
      const input: IUpdateProfileInputDto = {
        userId: "user-123",
        bio: null,
      };

      const mockProfile = createMockProfile(
        "user-123",
        "John Doe",
        "Existing bio",
      );

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(mockProfile)),
      );
      vi.mocked(mockProfileRepo.update).mockResolvedValue(
        Result.ok(mockProfile),
      );

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.bio).toBeNull();
    });

    it("should update avatar URL", async () => {
      const input: IUpdateProfileInputDto = {
        userId: "user-123",
        avatarUrl: "https://example.com/new-avatar.jpg",
      };

      const mockProfile = createMockProfile("user-123", "John Doe");

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(mockProfile)),
      );
      vi.mocked(mockProfileRepo.update).mockResolvedValue(
        Result.ok(mockProfile),
      );

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.avatarUrl).toBe("https://example.com/new-avatar.jpg");
    });

    it("should clear avatar URL when set to null", async () => {
      const input: IUpdateProfileInputDto = {
        userId: "user-123",
        avatarUrl: null,
      };

      const mockProfile = createMockProfile(
        "user-123",
        "John Doe",
        undefined,
        "https://example.com/old-avatar.jpg",
      );

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(mockProfile)),
      );
      vi.mocked(mockProfileRepo.update).mockResolvedValue(
        Result.ok(mockProfile),
      );

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.avatarUrl).toBeNull();
    });

    it("should update multiple fields at once", async () => {
      const input: IUpdateProfileInputDto = {
        userId: "user-123",
        displayName: "New Name",
        bio: "New bio",
        avatarUrl: "https://example.com/new-avatar.jpg",
      };

      const mockProfile = createMockProfile("user-123", "Old Name", "Old bio");

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(mockProfile)),
      );
      vi.mocked(mockProfileRepo.update).mockResolvedValue(
        Result.ok(mockProfile),
      );

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.displayName).toBe("New Name");
      expect(output.bio).toBe("New bio");
      expect(output.avatarUrl).toBe("https://example.com/new-avatar.jpg");
    });
  });

  describe("validation errors", () => {
    it("should fail when display name is empty", async () => {
      const input: IUpdateProfileInputDto = {
        userId: "user-123",
        displayName: "",
      };

      const mockProfile = createMockProfile("user-123", "John Doe");

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(mockProfile)),
      );

      const result = await useCase.execute(input);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("required");
    });

    it("should fail when display name exceeds 50 characters", async () => {
      const input: IUpdateProfileInputDto = {
        userId: "user-123",
        displayName: "a".repeat(51),
      };

      const mockProfile = createMockProfile("user-123", "John Doe");

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(mockProfile)),
      );

      const result = await useCase.execute(input);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("50");
    });

    it("should fail when bio exceeds 500 characters", async () => {
      const input: IUpdateProfileInputDto = {
        userId: "user-123",
        bio: "a".repeat(501),
      };

      const mockProfile = createMockProfile("user-123", "John Doe");

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(mockProfile)),
      );

      const result = await useCase.execute(input);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("500");
    });
  });

  describe("business rule errors", () => {
    it("should fail when profile not found", async () => {
      const input: IUpdateProfileInputDto = {
        userId: "user-123",
        displayName: "New Name",
      };

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(input);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("not found");
      expect(mockProfileRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when findByUserId returns error", async () => {
      const input: IUpdateProfileInputDto = {
        userId: "user-123",
        displayName: "New Name",
      };

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(input);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when update returns error", async () => {
      const input: IUpdateProfileInputDto = {
        userId: "user-123",
        displayName: "New Name",
      };

      const mockProfile = createMockProfile("user-123", "John Doe");

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(mockProfile)),
      );
      vi.mocked(mockProfileRepo.update).mockResolvedValue(
        Result.fail("Update failed"),
      );

      const result = await useCase.execute(input);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Update failed");
    });
  });
});
