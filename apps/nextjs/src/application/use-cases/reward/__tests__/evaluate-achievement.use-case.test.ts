import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IAchievementQueryProvider } from "@/application/ports/achievement-query.provider.port";
import type { INotificationRepository } from "@/application/ports/notification-repository.port";
import type {
  IAchievementDefinitionRecord,
  IRewardRepository,
} from "@/application/ports/reward-repository.port";
import { EvaluateAchievementUseCase } from "../evaluate-achievement.use-case";

const makeDefinition = (
  overrides: Partial<IAchievementDefinitionRecord> = {},
): IAchievementDefinitionRecord => ({
  id: "ach-first-post",
  type: "sticker",
  key: "first-post",
  name: "First Post!",
  description: "Write your first post",
  criteria: { eventType: "PostCreated", threshold: 1, field: "count" },
  iconUrl: null,
  createdAt: new Date(),
  ...overrides,
});

describe("EvaluateAchievementUseCase", () => {
  let useCase: EvaluateAchievementUseCase;
  let mockRewardRepo: {
    getDefinitionsByEventType: ReturnType<typeof vi.fn>;
    findByUserIdAndDefinitionId: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    [key: string]: ReturnType<typeof vi.fn>;
  };
  let mockNotificationRepo: {
    create: ReturnType<typeof vi.fn>;
    [key: string]: ReturnType<typeof vi.fn>;
  };
  let mockQueryProvider: IAchievementQueryProvider;
  let mockCountQuery: ReturnType<typeof vi.fn>;
  let mockFieldQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCountQuery = vi.fn().mockResolvedValue(0);
    mockFieldQuery = vi.fn().mockResolvedValue(0);

    mockRewardRepo = {
      getDefinitionsByEventType: vi.fn().mockResolvedValue(Result.ok([])),
      findByUserIdAndDefinitionId: vi
        .fn()
        .mockResolvedValue(Result.ok(Option.none())),
      create: vi.fn().mockResolvedValue(Result.ok({})),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
      getAllDefinitions: vi.fn(),
      getDefinitionsByType: vi.fn(),
    };

    mockNotificationRepo = {
      create: vi.fn().mockResolvedValue(Result.ok({})),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
    };

    mockQueryProvider = {
      getQueryForField: vi.fn().mockReturnValue(null),
      getCountQueryForEventType: vi.fn().mockReturnValue(mockCountQuery),
    };

    useCase = new EvaluateAchievementUseCase(
      mockRewardRepo as unknown as IRewardRepository,
      mockNotificationRepo as unknown as INotificationRepository,
      mockQueryProvider,
    );
  });

  describe("happy path", () => {
    it("should award first-post sticker when post count reaches 1", async () => {
      const definition = makeDefinition();
      mockRewardRepo.getDefinitionsByEventType.mockResolvedValue(
        Result.ok([definition]),
      );
      mockCountQuery.mockResolvedValue(1);

      const result = await useCase.execute({
        userId: "user-1",
        eventType: "PostCreated",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().newRewards).toHaveLength(1);
      expect(result.getValue().newRewards[0]?.achievementKey).toBe(
        "first-post",
      );
      expect(result.getValue().newRewards[0]?.achievementType).toBe("sticker");
      expect(mockRewardRepo.create).toHaveBeenCalledOnce();
      expect(mockNotificationRepo.create).toHaveBeenCalledOnce();
    });

    it("should award journal-streak-7 sticker when streak reaches 7", async () => {
      const definition = makeDefinition({
        id: "ach-journal-streak-7",
        key: "journal-streak-7",
        name: "Week Warrior",
        criteria: {
          eventType: "PostCreated",
          threshold: 7,
          field: "journalStreak",
        },
      });
      mockRewardRepo.getDefinitionsByEventType.mockResolvedValue(
        Result.ok([definition]),
      );
      (
        mockQueryProvider.getQueryForField as ReturnType<typeof vi.fn>
      ).mockReturnValue(mockFieldQuery);
      mockFieldQuery.mockResolvedValue(7);

      const result = await useCase.execute({
        userId: "user-1",
        eventType: "PostCreated",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().newRewards).toHaveLength(1);
      expect(result.getValue().newRewards[0]?.achievementKey).toBe(
        "journal-streak-7",
      );
    });

    it("should award mood-streak-30 badge when streak reaches 30", async () => {
      const definition = makeDefinition({
        id: "ach-mood-streak-30",
        type: "badge",
        key: "mood-streak-30",
        name: "Mood Master",
        criteria: {
          eventType: "MoodRecorded",
          threshold: 30,
          field: "moodStreak",
        },
      });
      mockRewardRepo.getDefinitionsByEventType.mockResolvedValue(
        Result.ok([definition]),
      );
      (
        mockQueryProvider.getQueryForField as ReturnType<typeof vi.fn>
      ).mockReturnValue(mockFieldQuery);
      mockFieldQuery.mockResolvedValue(30);

      const result = await useCase.execute({
        userId: "user-1",
        eventType: "MoodRecorded",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().newRewards).toHaveLength(1);
      expect(result.getValue().newRewards[0]?.achievementType).toBe("badge");
    });
  });

  describe("idempotency", () => {
    it("should not create duplicate reward when already earned", async () => {
      const definition = makeDefinition();
      mockRewardRepo.getDefinitionsByEventType.mockResolvedValue(
        Result.ok([definition]),
      );
      mockRewardRepo.findByUserIdAndDefinitionId.mockResolvedValue(
        Result.ok(Option.some({})),
      );

      const result = await useCase.execute({
        userId: "user-1",
        eventType: "PostCreated",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().newRewards).toHaveLength(0);
      expect(mockRewardRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("notification", () => {
    it("should create notification when new reward is earned", async () => {
      const definition = makeDefinition();
      mockRewardRepo.getDefinitionsByEventType.mockResolvedValue(
        Result.ok([definition]),
      );
      mockCountQuery.mockResolvedValue(1);

      await useCase.execute({
        userId: "user-1",
        eventType: "PostCreated",
      });

      expect(mockNotificationRepo.create).toHaveBeenCalledOnce();
    });
  });

  describe("multiple rewards", () => {
    it("should award multiple rewards from single event", async () => {
      const firstPost = makeDefinition();
      const posts10 = makeDefinition({
        id: "ach-posts-10",
        key: "posts-10",
        name: "Storyteller",
        criteria: { eventType: "PostCreated", threshold: 10, field: "count" },
      });
      mockRewardRepo.getDefinitionsByEventType.mockResolvedValue(
        Result.ok([firstPost, posts10]),
      );
      mockCountQuery.mockResolvedValue(10);

      const result = await useCase.execute({
        userId: "user-1",
        eventType: "PostCreated",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().newRewards).toHaveLength(2);
      expect(mockRewardRepo.create).toHaveBeenCalledTimes(2);
    });
  });

  describe("no match", () => {
    it("should return empty when event type has no matching definitions", async () => {
      mockRewardRepo.getDefinitionsByEventType.mockResolvedValue(Result.ok([]));

      const result = await useCase.execute({
        userId: "user-1",
        eventType: "UnknownEvent",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().newRewards).toHaveLength(0);
    });
  });

  describe("threshold not met", () => {
    it("should not award when user is below threshold", async () => {
      const definition = makeDefinition({
        criteria: { eventType: "PostCreated", threshold: 10, field: "count" },
      });
      mockRewardRepo.getDefinitionsByEventType.mockResolvedValue(
        Result.ok([definition]),
      );
      mockCountQuery.mockResolvedValue(5);

      const result = await useCase.execute({
        userId: "user-1",
        eventType: "PostCreated",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().newRewards).toHaveLength(0);
      expect(mockRewardRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("streak broken", () => {
    it("should not award when streak is below threshold", async () => {
      const definition = makeDefinition({
        criteria: {
          eventType: "PostCreated",
          threshold: 7,
          field: "journalStreak",
        },
      });
      mockRewardRepo.getDefinitionsByEventType.mockResolvedValue(
        Result.ok([definition]),
      );
      (
        mockQueryProvider.getQueryForField as ReturnType<typeof vi.fn>
      ).mockReturnValue(mockFieldQuery);
      mockFieldQuery.mockResolvedValue(3);

      const result = await useCase.execute({
        userId: "user-1",
        eventType: "PostCreated",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().newRewards).toHaveLength(0);
    });
  });

  describe("error handling", () => {
    it("should fail when reward repo returns error on getDefinitions", async () => {
      mockRewardRepo.getDefinitionsByEventType.mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        userId: "user-1",
        eventType: "PostCreated",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Database error");
    });

    it("should skip definition when findByUserIdAndDefinitionId returns error", async () => {
      const definition = makeDefinition();
      mockRewardRepo.getDefinitionsByEventType.mockResolvedValue(
        Result.ok([definition]),
      );
      mockRewardRepo.findByUserIdAndDefinitionId.mockResolvedValue(
        Result.fail("DB read error"),
      );

      const result = await useCase.execute({
        userId: "user-1",
        eventType: "PostCreated",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().newRewards).toHaveLength(0);
    });

    it("should skip definition when reward create returns error", async () => {
      const definition = makeDefinition();
      mockRewardRepo.getDefinitionsByEventType.mockResolvedValue(
        Result.ok([definition]),
      );
      mockCountQuery.mockResolvedValue(1);
      mockRewardRepo.create.mockResolvedValue(Result.fail("DB write error"));

      const result = await useCase.execute({
        userId: "user-1",
        eventType: "PostCreated",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().newRewards).toHaveLength(0);
    });
  });

  describe("no definitions", () => {
    it("should return empty when definitions list is empty", async () => {
      mockRewardRepo.getDefinitionsByEventType.mockResolvedValue(Result.ok([]));

      const result = await useCase.execute({
        userId: "user-1",
        eventType: "PostCreated",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().newRewards).toHaveLength(0);
      expect(mockRewardRepo.create).not.toHaveBeenCalled();
    });
  });
});
