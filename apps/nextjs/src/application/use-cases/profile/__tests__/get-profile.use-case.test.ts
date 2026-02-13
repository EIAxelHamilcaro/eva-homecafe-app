import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IGetProfileInputDto } from "@/application/dto/profile/get-profile.dto";
import type { IProfileRepository } from "@/application/ports/profile-repository.port";
import { Profile } from "@/domain/profile/profile.aggregate";
import { ProfileId } from "@/domain/profile/profile-id";
import { Bio } from "@/domain/profile/value-objects/bio.vo";
import { DisplayName } from "@/domain/profile/value-objects/display-name.vo";
import { GetProfileUseCase } from "../get-profile.use-case";

describe("GetProfileUseCase", () => {
  let useCase: GetProfileUseCase;
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
        phone: Option.none(),
        birthday: Option.none(),
        profession: Option.none(),
        address: Option.none(),
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
    useCase = new GetProfileUseCase(mockProfileRepo);
  });

  describe("happy path", () => {
    it("should return profile when found", async () => {
      const input: IGetProfileInputDto = {
        userId: "user-123",
      };

      const mockProfile = createMockProfile(
        "user-123",
        "John Doe",
        "Hello world",
        "https://example.com/avatar.jpg",
      );

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(mockProfile)),
      );

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      expect(mockProfileRepo.findByUserId).toHaveBeenCalledWith("user-123");

      const output = result.getValue();
      expect(output).not.toBeNull();
      expect(output?.userId).toBe("user-123");
      expect(output?.displayName).toBe("John Doe");
      expect(output?.bio).toBe("Hello world");
      expect(output?.avatarUrl).toBe("https://example.com/avatar.jpg");
    });

    it("should return profile without bio", async () => {
      const input: IGetProfileInputDto = {
        userId: "user-123",
      };

      const mockProfile = createMockProfile("user-123", "John Doe");

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(mockProfile)),
      );

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output?.bio).toBeNull();
      expect(output?.avatarUrl).toBeNull();
    });

    it("should return null when profile not found", async () => {
      const input: IGetProfileInputDto = {
        userId: "user-123",
      };

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      const input: IGetProfileInputDto = {
        userId: "user-123",
      };

      vi.mocked(mockProfileRepo.findByUserId).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(input);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
