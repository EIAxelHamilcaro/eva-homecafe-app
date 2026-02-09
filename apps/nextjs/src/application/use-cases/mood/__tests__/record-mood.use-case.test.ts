import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IRecordMoodInputDto } from "@/application/dto/mood/record-mood.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IMoodRepository } from "@/application/ports/mood-repository.port";
import type { MoodRecordedEvent } from "@/domain/mood/events/mood-recorded.event";
import { MoodEntry } from "@/domain/mood/mood-entry.aggregate";
import { MoodCategory } from "@/domain/mood/value-objects/mood-category.vo";
import { MoodIntensity } from "@/domain/mood/value-objects/mood-intensity.vo";
import { RecordMoodUseCase } from "../record-mood.use-case";

describe("RecordMoodUseCase", () => {
  let useCase: RecordMoodUseCase;
  let mockMoodRepo: IMoodRepository;
  let mockEventDispatcher: IEventDispatcher;

  const validInput: IRecordMoodInputDto = {
    userId: "user-123",
    category: "bonheur",
    intensity: 7,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMoodRepo = {
      create: vi
        .fn()
        .mockImplementation((entry: MoodEntry) =>
          Promise.resolve(Result.ok(entry)),
        ),
      update: vi
        .fn()
        .mockImplementation((entry: MoodEntry) =>
          Promise.resolve(Result.ok(entry)),
        ),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findTodayByUserId: vi.fn().mockResolvedValue(Result.ok(Option.none())),
    } as unknown as IMoodRepository;
    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };
    useCase = new RecordMoodUseCase(mockMoodRepo, mockEventDispatcher);
  });

  describe("happy path - create new mood entry", () => {
    it("should create a mood entry with valid category and intensity", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.category).toBe("bonheur");
      expect(output.intensity).toBe(7);
      expect(output.userId).toBe("user-123");
      expect(output.isUpdate).toBe(false);
      expect(output.id).toBeDefined();
      expect(output.createdAt).toBeDefined();
    });

    it("should persist the mood entry via repository create", async () => {
      await useCase.execute(validInput);

      expect(mockMoodRepo.create).toHaveBeenCalledOnce();
      expect(mockMoodRepo.findTodayByUserId).toHaveBeenCalledWith("user-123");
    });

    it("should add MoodRecordedEvent with correct payload", async () => {
      await useCase.execute(validInput);

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      expect(events).toHaveLength(1);

      const event = events[0] as unknown as MoodRecordedEvent;
      expect(event.type).toBe("MoodRecorded");
      expect(event.aggregateId).toBeDefined();
      expect(event.userId).toBe("user-123");
      expect(event.category).toBe("bonheur");
      expect(event.intensity).toBe(7);
    });

    it("should accept all 9 valid mood categories", async () => {
      const categories = [
        "calme",
        "enervement",
        "excitation",
        "anxiete",
        "tristesse",
        "bonheur",
        "ennui",
        "nervosite",
        "productivite",
      ] as const;

      for (const category of categories) {
        vi.mocked(mockMoodRepo.findTodayByUserId).mockResolvedValue(
          Result.ok(Option.none()),
        );
        const result = await useCase.execute({
          ...validInput,
          category,
        });
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().category).toBe(category);
      }
    });

    it("should accept intensity at minimum (1) and maximum (10)", async () => {
      const resultMin = await useCase.execute({
        ...validInput,
        intensity: 1,
      });
      expect(resultMin.isSuccess).toBe(true);
      expect(resultMin.getValue().intensity).toBe(1);

      vi.mocked(mockMoodRepo.findTodayByUserId).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const resultMax = await useCase.execute({
        ...validInput,
        intensity: 10,
      });
      expect(resultMax.isSuccess).toBe(true);
      expect(resultMax.getValue().intensity).toBe(10);
    });
  });

  describe("happy path - update existing mood entry", () => {
    it("should update an existing mood entry when one exists today", async () => {
      const existingCategory = MoodCategory.create("tristesse" as string);
      const existingIntensity = MoodIntensity.create(3 as number);
      const existingEntry = MoodEntry.create({
        userId: "user-123",
        category: existingCategory.getValue(),
        intensity: existingIntensity.getValue(),
      }).getValue();

      vi.mocked(mockMoodRepo.findTodayByUserId).mockResolvedValue(
        Result.ok(Option.some(existingEntry)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.category).toBe("bonheur");
      expect(output.intensity).toBe(7);
      expect(output.isUpdate).toBe(true);
    });

    it("should call repository update when updating existing entry", async () => {
      const existingCategory = MoodCategory.create("calme" as string);
      const existingIntensity = MoodIntensity.create(5 as number);
      const existingEntry = MoodEntry.create({
        userId: "user-123",
        category: existingCategory.getValue(),
        intensity: existingIntensity.getValue(),
      }).getValue();

      vi.mocked(mockMoodRepo.findTodayByUserId).mockResolvedValue(
        Result.ok(Option.some(existingEntry)),
      );

      await useCase.execute(validInput);

      expect(mockMoodRepo.update).toHaveBeenCalledOnce();
      expect(mockMoodRepo.create).not.toHaveBeenCalled();
    });

    it("should add MoodRecordedEvent when updating", async () => {
      const existingCategory = MoodCategory.create("ennui" as string);
      const existingIntensity = MoodIntensity.create(2 as number);
      const existingEntry = MoodEntry.create({
        userId: "user-123",
        category: existingCategory.getValue(),
        intensity: existingIntensity.getValue(),
      }).getValue();
      existingEntry.clearEvents();

      vi.mocked(mockMoodRepo.findTodayByUserId).mockResolvedValue(
        Result.ok(Option.some(existingEntry)),
      );

      await useCase.execute(validInput);

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      expect(events).toHaveLength(1);

      const event = events[0] as unknown as MoodRecordedEvent;
      expect(event.type).toBe("MoodRecorded");
      expect(event.category).toBe("bonheur");
      expect(event.intensity).toBe(7);
    });
  });

  describe("validation errors", () => {
    it("should fail when category is invalid", async () => {
      const result = await useCase.execute({
        ...validInput,
        category: "invalid-mood" as IRecordMoodInputDto["category"],
      });

      expect(result.isFailure).toBe(true);
      expect(mockMoodRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when category is empty string", async () => {
      const result = await useCase.execute({
        ...validInput,
        category: "" as IRecordMoodInputDto["category"],
      });

      expect(result.isFailure).toBe(true);
      expect(mockMoodRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when intensity is below 1", async () => {
      const result = await useCase.execute({
        ...validInput,
        intensity: 0,
      });

      expect(result.isFailure).toBe(true);
      expect(mockMoodRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when intensity is above 10", async () => {
      const result = await useCase.execute({
        ...validInput,
        intensity: 11,
      });

      expect(result.isFailure).toBe(true);
      expect(mockMoodRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when intensity is not an integer", async () => {
      const result = await useCase.execute({
        ...validInput,
        intensity: 5.5,
      });

      expect(result.isFailure).toBe(true);
      expect(mockMoodRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when findTodayByUserId returns error", async () => {
      vi.mocked(mockMoodRepo.findTodayByUserId).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when repository create returns error", async () => {
      vi.mocked(mockMoodRepo.create).mockResolvedValue(
        Result.fail("Failed to save"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Failed to save");
    });

    it("should fail when repository update returns error", async () => {
      const existingCategory = MoodCategory.create("calme" as string);
      const existingIntensity = MoodIntensity.create(5 as number);
      const existingEntry = MoodEntry.create({
        userId: "user-123",
        category: existingCategory.getValue(),
        intensity: existingIntensity.getValue(),
      }).getValue();

      vi.mocked(mockMoodRepo.findTodayByUserId).mockResolvedValue(
        Result.ok(Option.some(existingEntry)),
      );
      vi.mocked(mockMoodRepo.update).mockResolvedValue(
        Result.fail("Update failed"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Update failed");
    });
  });
});
