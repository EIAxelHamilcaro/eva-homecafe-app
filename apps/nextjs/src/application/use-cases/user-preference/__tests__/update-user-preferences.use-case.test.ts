import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IUpdateUserPreferencesInputDto } from "@/application/dto/user-preference/update-user-preferences.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IUserPreferenceRepository } from "@/application/ports/user-preference-repository.port";
import type { UserPreferenceUpdatedEvent } from "@/domain/user-preference/events/user-preference-updated.event";
import { UpdateUserPreferencesUseCase } from "../update-user-preferences.use-case";

describe("UpdateUserPreferencesUseCase", () => {
  let useCase: UpdateUserPreferencesUseCase;
  let mockUserPreferenceRepo: IUserPreferenceRepository;
  let mockEventDispatcher: IEventDispatcher;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserPreferenceRepo = {
      create: vi
        .fn()
        .mockImplementation((pref) => Promise.resolve(Result.ok(pref))),
      update: vi
        .fn()
        .mockImplementation((pref) => Promise.resolve(Result.ok(pref))),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
    } as unknown as IUserPreferenceRepository;

    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };

    useCase = new UpdateUserPreferencesUseCase(
      mockUserPreferenceRepo,
      mockEventDispatcher,
    );
  });

  const baseInput: IUpdateUserPreferencesInputDto = {
    userId: "user-123",
  };

  const createExistingPreference = async () => {
    const { UserPreference } = await import(
      "@/domain/user-preference/user-preference.aggregate"
    );
    const prefResult = UserPreference.createDefault("user-123");
    return prefResult.getValue();
  };

  describe("happy path", () => {
    it("should update a single boolean field", async () => {
      const pref = await createExistingPreference();
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );

      const result = await useCase.execute({
        ...baseInput,
        emailNotifications: false,
      });

      expect(result.isSuccess).toBe(true);
      const dto = result.getValue();
      expect(dto.emailNotifications).toBe(false);
      expect(dto.pushNotifications).toBe(true);
      expect(mockUserPreferenceRepo.update).toHaveBeenCalledOnce();
      expect(mockUserPreferenceRepo.create).not.toHaveBeenCalled();
    });

    it("should update multiple fields at once", async () => {
      const pref = await createExistingPreference();
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );

      const result = await useCase.execute({
        ...baseInput,
        emailNotifications: false,
        pushNotifications: false,
        language: "en",
        themeMode: "dark",
      });

      expect(result.isSuccess).toBe(true);
      const dto = result.getValue();
      expect(dto.emailNotifications).toBe(false);
      expect(dto.pushNotifications).toBe(false);
      expect(dto.language).toBe("en");
      expect(dto.themeMode).toBe("dark");
    });

    it("should create default then update when no preferences exist", async () => {
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({
        ...baseInput,
        themeMode: "dark",
      });

      expect(result.isSuccess).toBe(true);
      const dto = result.getValue();
      expect(dto.themeMode).toBe("dark");
      expect(dto.language).toBe("fr");
      expect(mockUserPreferenceRepo.create).toHaveBeenCalledOnce();
      expect(mockUserPreferenceRepo.update).not.toHaveBeenCalled();
    });

    it("should update notification toggles", async () => {
      const pref = await createExistingPreference();
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );

      const result = await useCase.execute({
        ...baseInput,
        notifyNewMessages: false,
        notifyFriendActivity: false,
        notifyBadgesEarned: false,
        notifyJournalReminder: false,
      });

      expect(result.isSuccess).toBe(true);
      const dto = result.getValue();
      expect(dto.notifyNewMessages).toBe(false);
      expect(dto.notifyFriendActivity).toBe(false);
      expect(dto.notifyBadgesEarned).toBe(false);
      expect(dto.notifyJournalReminder).toBe(false);
    });

    it("should update privacy settings", async () => {
      const pref = await createExistingPreference();
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );

      const result = await useCase.execute({
        ...baseInput,
        profileVisibility: false,
        rewardsVisibility: "nobody",
      });

      expect(result.isSuccess).toBe(true);
      const dto = result.getValue();
      expect(dto.profileVisibility).toBe(false);
      expect(dto.rewardsVisibility).toBe("nobody");
    });

    it("should update customization settings", async () => {
      const pref = await createExistingPreference();
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );

      const result = await useCase.execute({
        ...baseInput,
        themeMode: "light",
        language: "en",
        timeFormat: "12h",
      });

      expect(result.isSuccess).toBe(true);
      const dto = result.getValue();
      expect(dto.themeMode).toBe("light");
      expect(dto.language).toBe("en");
      expect(dto.timeFormat).toBe("12h");
    });
  });

  describe("domain events", () => {
    it("should dispatch UserPreferenceUpdatedEvent on update", async () => {
      const pref = await createExistingPreference();
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );

      await useCase.execute({
        ...baseInput,
        emailNotifications: false,
      });

      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledOnce();
      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      expect(events).toHaveLength(1);

      const event = events[0] as unknown as UserPreferenceUpdatedEvent;
      expect(event.type).toBe("UserPreferenceUpdated");
      expect(event.userId).toBe("user-123");
    });

    it("should not dispatch events when validation fails", async () => {
      const pref = await createExistingPreference();
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );

      await useCase.execute({
        ...baseInput,
        language: "invalid" as "fr" | "en",
      });

      expect(mockEventDispatcher.dispatchAll).not.toHaveBeenCalled();
    });
  });

  describe("validation errors", () => {
    it("should fail when language value is invalid", async () => {
      const pref = await createExistingPreference();
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );

      const result = await useCase.execute({
        ...baseInput,
        language: "invalid" as "fr" | "en",
      });

      expect(result.isFailure).toBe(true);
      expect(mockUserPreferenceRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when themeMode value is invalid", async () => {
      const pref = await createExistingPreference();
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );

      const result = await useCase.execute({
        ...baseInput,
        themeMode: "invalid" as "light" | "dark" | "system",
      });

      expect(result.isFailure).toBe(true);
      expect(mockUserPreferenceRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when timeFormat value is invalid", async () => {
      const pref = await createExistingPreference();
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );

      const result = await useCase.execute({
        ...baseInput,
        timeFormat: "invalid" as "12h" | "24h",
      });

      expect(result.isFailure).toBe(true);
      expect(mockUserPreferenceRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when rewardsVisibility value is invalid", async () => {
      const pref = await createExistingPreference();
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );

      const result = await useCase.execute({
        ...baseInput,
        rewardsVisibility: "invalid" as "everyone" | "friends" | "nobody",
      });

      expect(result.isFailure).toBe(true);
      expect(mockUserPreferenceRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when findByUserId returns error", async () => {
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        ...baseInput,
        emailNotifications: false,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
      expect(mockUserPreferenceRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when update returns error", async () => {
      const pref = await createExistingPreference();
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.some(pref)),
      );
      vi.mocked(mockUserPreferenceRepo.update).mockResolvedValue(
        Result.fail("Update failed"),
      );

      const result = await useCase.execute({
        ...baseInput,
        emailNotifications: false,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Update failed");
      expect(mockEventDispatcher.dispatchAll).not.toHaveBeenCalled();
    });

    it("should fail when create returns error for new preferences", async () => {
      vi.mocked(mockUserPreferenceRepo.findByUserId).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockUserPreferenceRepo.create).mockResolvedValue(
        Result.fail("Insert failed"),
      );

      const result = await useCase.execute({
        ...baseInput,
        themeMode: "dark",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Insert failed");
      expect(mockEventDispatcher.dispatchAll).not.toHaveBeenCalled();
    });
  });
});
