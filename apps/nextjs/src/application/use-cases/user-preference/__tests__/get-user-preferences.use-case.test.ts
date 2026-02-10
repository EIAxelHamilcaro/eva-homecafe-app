import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IGetUserPreferencesInputDto } from "@/application/dto/user-preference/get-user-preferences.dto";
import type { IUserPreferenceRepository } from "@/application/ports/user-preference-repository.port";
import { GetUserPreferencesUseCase } from "../get-user-preferences.use-case";

describe("GetUserPreferencesUseCase", () => {
  let useCase: GetUserPreferencesUseCase;
  let mockUserPreferenceRepo: IUserPreferenceRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserPreferenceRepo = {
      create: vi
        .fn()
        .mockImplementation((pref) => Promise.resolve(Result.ok(pref))),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
    } as unknown as IUserPreferenceRepository;

    useCase = new GetUserPreferencesUseCase(mockUserPreferenceRepo);
  });

  const validInput: IGetUserPreferencesInputDto = {
    userId: "user-123",
  };

  describe("happy path", () => {
    it("should return existing preferences when found", async () => {
      const { UserPreference } = await import(
        "@/domain/user-preference/user-preference.aggregate"
      );
      const prefResult = UserPreference.createDefault("user-123");
      const pref = prefResult.getValue();

      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const dto = result.getValue();
      expect(dto.userId).toBe("user-123");
      expect(dto.emailNotifications).toBe(true);
      expect(dto.pushNotifications).toBe(true);
      expect(dto.notifyNewMessages).toBe(true);
      expect(dto.notifyFriendActivity).toBe(true);
      expect(dto.notifyBadgesEarned).toBe(true);
      expect(dto.notifyJournalReminder).toBe(true);
      expect(dto.profileVisibility).toBe(true);
      expect(dto.rewardsVisibility).toBe("friends");
      expect(dto.themeMode).toBe("system");
      expect(dto.language).toBe("fr");
      expect(dto.timeFormat).toBe("24h");
      expect(mockUserPreferenceRepo.create).not.toHaveBeenCalled();
    });

    it("should create default preferences when none exist", async () => {
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const dto = result.getValue();
      expect(dto.userId).toBe("user-123");
      expect(dto.emailNotifications).toBe(true);
      expect(dto.language).toBe("fr");
      expect(dto.themeMode).toBe("system");
      expect(dto.timeFormat).toBe("24h");
      expect(dto.rewardsVisibility).toBe("friends");
      expect(mockUserPreferenceRepo.create).toHaveBeenCalledOnce();
    });

    it("should return correct DTO structure with all fields", async () => {
      const { UserPreference } = await import(
        "@/domain/user-preference/user-preference.aggregate"
      );
      const prefResult = UserPreference.createDefault("user-123");
      const pref = prefResult.getValue();

      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );

      const result = await useCase.execute(validInput);
      const dto = result.getValue();

      expect(dto).toHaveProperty("id");
      expect(dto).toHaveProperty("userId");
      expect(dto).toHaveProperty("emailNotifications");
      expect(dto).toHaveProperty("pushNotifications");
      expect(dto).toHaveProperty("notifyNewMessages");
      expect(dto).toHaveProperty("notifyFriendActivity");
      expect(dto).toHaveProperty("notifyBadgesEarned");
      expect(dto).toHaveProperty("notifyJournalReminder");
      expect(dto).toHaveProperty("profileVisibility");
      expect(dto).toHaveProperty("rewardsVisibility");
      expect(dto).toHaveProperty("themeMode");
      expect(dto).toHaveProperty("language");
      expect(dto).toHaveProperty("timeFormat");
      expect(dto).toHaveProperty("createdAt");
      expect(dto).toHaveProperty("updatedAt");
    });
  });

  describe("error handling", () => {
    it("should fail when findByUserId returns error", async () => {
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
      expect(mockUserPreferenceRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when create returns error for new preferences", async () => {
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockUserPreferenceRepo.create).mockResolvedValue(
        Result.fail("Insert failed"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Insert failed");
    });
  });
});
