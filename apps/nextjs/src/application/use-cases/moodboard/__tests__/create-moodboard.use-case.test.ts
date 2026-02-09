import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ICreateMoodboardInputDto } from "@/application/dto/moodboard/create-moodboard.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IMoodboardRepository } from "@/application/ports/moodboard-repository.port";
import type { MoodboardCreatedEvent } from "@/domain/moodboard/events/moodboard-created.event";
import type { Moodboard } from "@/domain/moodboard/moodboard.aggregate";
import { CreateMoodboardUseCase } from "../create-moodboard.use-case";

describe("CreateMoodboardUseCase", () => {
  let useCase: CreateMoodboardUseCase;
  let mockMoodboardRepo: IMoodboardRepository;
  let mockEventDispatcher: IEventDispatcher;

  const validInput: ICreateMoodboardInputDto = {
    title: "My Inspiration Board",
    userId: "user-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMoodboardRepo = {
      create: vi
        .fn()
        .mockImplementation((moodboard: Moodboard) =>
          Promise.resolve(Result.ok(moodboard)),
        ),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
    } as unknown as IMoodboardRepository;
    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };
    useCase = new CreateMoodboardUseCase(
      mockMoodboardRepo,
      mockEventDispatcher,
    );
  });

  describe("happy path", () => {
    it("should create a moodboard with valid title", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.title).toBe("My Inspiration Board");
      expect(output.userId).toBe("user-123");
      expect(output.id).toBeDefined();
      expect(output.createdAt).toBeDefined();
    });

    it("should persist the moodboard via repository", async () => {
      await useCase.execute(validInput);

      expect(mockMoodboardRepo.create).toHaveBeenCalledOnce();
      expect(mockMoodboardRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          _props: expect.objectContaining({
            userId: "user-123",
            pins: [],
          }),
        }),
      );
    });

    it("should add MoodboardCreatedEvent with correct payload", async () => {
      await useCase.execute(validInput);

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      expect(events).toHaveLength(1);

      const event = events[0] as unknown as MoodboardCreatedEvent;
      expect(event.type).toBe("MoodboardCreated");
      expect(event.aggregateId).toBeDefined();
      expect(event.userId).toBe("user-123");
      expect(event.title).toBe("My Inspiration Board");
    });

    it("should create moodboard with empty pins array", async () => {
      await useCase.execute(validInput);

      const createdMoodboard = vi.mocked(mockMoodboardRepo.create).mock
        .calls[0]?.[0] as Moodboard;
      expect(createdMoodboard.get("pins")).toEqual([]);
    });
  });

  describe("validation errors", () => {
    it("should fail when title is empty", async () => {
      const result = await useCase.execute({ ...validInput, title: "" });

      expect(result.isFailure).toBe(true);
      expect(mockMoodboardRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when title exceeds 100 characters", async () => {
      const result = await useCase.execute({
        ...validInput,
        title: "a".repeat(101),
      });

      expect(result.isFailure).toBe(true);
      expect(mockMoodboardRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      vi.mocked(mockMoodboardRepo.create).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
