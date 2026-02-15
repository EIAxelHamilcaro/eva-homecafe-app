import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IEmotionRepository } from "@/application/ports/emotion-repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import { EmotionEntry } from "@/domain/emotion/emotion-entry.aggregate";
import { EmotionCategory } from "@/domain/emotion/value-objects/emotion-category.vo";
import { RecordEmotionUseCase } from "../record-emotion.use-case";

describe("RecordEmotionUseCase", () => {
  let useCase: RecordEmotionUseCase;
  let mockEmotionRepo: IEmotionRepository;
  let mockEventDispatcher: IEventDispatcher;

  beforeEach(() => {
    vi.clearAllMocks();
    mockEmotionRepo = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserIdAndDate: vi.fn(),
    } as unknown as IEmotionRepository;
    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    } as unknown as IEventDispatcher;

    useCase = new RecordEmotionUseCase(mockEmotionRepo, mockEventDispatcher);
  });

  describe("happy path", () => {
    it("should record new emotion entry", async () => {
      vi.mocked(mockEmotionRepo.findByUserIdAndDate).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockEmotionRepo.create).mockResolvedValue(
        Result.ok({} as EmotionEntry),
      );

      const result = await useCase.execute({
        userId: "user-1",
        category: "calme",
        emotionDate: "2024-01-15",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.userId).toBe("user-1");
      expect(output.category).toBe("calme");
      expect(output.isUpdate).toBe(false);
      expect(mockEmotionRepo.create).toHaveBeenCalledOnce();
      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledOnce();
    });

    it("should update existing emotion entry", async () => {
      const category = EmotionCategory.create("calme").getValue();
      const existingEntry = EmotionEntry.create({
        userId: "user-1",
        category,
        emotionDate: "2024-01-15",
      }).getValue();
      existingEntry.clearEvents();

      vi.mocked(mockEmotionRepo.findByUserIdAndDate).mockResolvedValue(
        Result.ok(Option.some(existingEntry)),
      );
      vi.mocked(mockEmotionRepo.update).mockResolvedValue(
        Result.ok({} as EmotionEntry),
      );

      const result = await useCase.execute({
        userId: "user-1",
        category: "bonheur",
        emotionDate: "2024-01-15",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.category).toBe("bonheur");
      expect(output.isUpdate).toBe(true);
      expect(mockEmotionRepo.update).toHaveBeenCalledOnce();
      expect(mockEmotionRepo.create).not.toHaveBeenCalled();
      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledOnce();
    });
  });

  describe("validation errors", () => {
    it("should fail when category is invalid", async () => {
      const result = await useCase.execute({
        userId: "user-1",
        category: "invalid_category",
        emotionDate: "2024-01-15",
      });

      expect(result.isFailure).toBe(true);
      expect(mockEmotionRepo.findByUserIdAndDate).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when findByUserIdAndDate fails", async () => {
      vi.mocked(mockEmotionRepo.findByUserIdAndDate).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        userId: "user-1",
        category: "calme",
        emotionDate: "2024-01-15",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when create fails", async () => {
      vi.mocked(mockEmotionRepo.findByUserIdAndDate).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockEmotionRepo.create).mockResolvedValue(
        Result.fail("Create failed"),
      );

      const result = await useCase.execute({
        userId: "user-1",
        category: "calme",
        emotionDate: "2024-01-15",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Create failed");
    });

    it("should fail when update fails", async () => {
      const category = EmotionCategory.create("calme").getValue();
      const existingEntry = EmotionEntry.create({
        userId: "user-1",
        category,
        emotionDate: "2024-01-15",
      }).getValue();
      existingEntry.clearEvents();

      vi.mocked(mockEmotionRepo.findByUserIdAndDate).mockResolvedValue(
        Result.ok(Option.some(existingEntry)),
      );
      vi.mocked(mockEmotionRepo.update).mockResolvedValue(
        Result.fail("Update failed"),
      );

      const result = await useCase.execute({
        userId: "user-1",
        category: "bonheur",
        emotionDate: "2024-01-15",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Update failed");
    });
  });

  describe("events", () => {
    it("should dispatch EmotionRecordedEvent on create", async () => {
      vi.mocked(mockEmotionRepo.findByUserIdAndDate).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockEmotionRepo.create).mockResolvedValue(
        Result.ok({} as EmotionEntry),
      );

      await useCase.execute({
        userId: "user-1",
        category: "calme",
        emotionDate: "2024-01-15",
      });

      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledOnce();
      const dispatchedEvents = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0];
      expect(dispatchedEvents).toBeDefined();
      expect(dispatchedEvents).toHaveLength(1);
    });

    it("should dispatch EmotionRecordedEvent on update", async () => {
      const category = EmotionCategory.create("calme").getValue();
      const existingEntry = EmotionEntry.create({
        userId: "user-1",
        category,
        emotionDate: "2024-01-15",
      }).getValue();
      existingEntry.clearEvents();

      vi.mocked(mockEmotionRepo.findByUserIdAndDate).mockResolvedValue(
        Result.ok(Option.some(existingEntry)),
      );
      vi.mocked(mockEmotionRepo.update).mockResolvedValue(
        Result.ok({} as EmotionEntry),
      );

      await useCase.execute({
        userId: "user-1",
        category: "bonheur",
        emotionDate: "2024-01-15",
      });

      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledOnce();
      const dispatchedEvents = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0];
      expect(dispatchedEvents).toBeDefined();
      expect(dispatchedEvents).toHaveLength(1);
    });
  });
});
