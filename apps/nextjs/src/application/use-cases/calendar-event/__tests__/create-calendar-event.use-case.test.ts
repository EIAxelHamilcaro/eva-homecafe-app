import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ICreateCalendarEventInputDto } from "@/application/dto/calendar-event/create-calendar-event.dto";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";
import { CreateCalendarEventUseCase } from "../create-calendar-event.use-case";

describe("CreateCalendarEventUseCase", () => {
  let useCase: CreateCalendarEventUseCase;
  let mockRepo: ICalendarEventRepository;

  const validInput: ICreateCalendarEventInputDto = {
    userId: "user-123",
    title: "Team meeting",
    color: "blue",
    date: "2026-03-15",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepo = {
      create: vi.fn().mockResolvedValue(Result.ok(undefined)),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserIdAndMonth: vi.fn(),
    } as unknown as ICalendarEventRepository;

    useCase = new CreateCalendarEventUseCase(mockRepo);
  });

  describe("happy path", () => {
    it("should create a calendar event with valid input", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const dto = result.getValue();
      expect(dto.title).toBe("Team meeting");
      expect(dto.color).toBe("blue");
      expect(dto.date).toBe("2026-03-15");
      expect(dto.userId).toBe("user-123");
      expect(dto.id).toBeDefined();
      expect(mockRepo.create).toHaveBeenCalledOnce();
    });
  });

  describe("validation errors", () => {
    it("should fail when title is empty", async () => {
      const result = await useCase.execute({ ...validInput, title: "" });

      expect(result.isFailure).toBe(true);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when title exceeds 100 characters", async () => {
      const longTitle = "a".repeat(101);
      const result = await useCase.execute({
        ...validInput,
        title: longTitle,
      });

      expect(result.isFailure).toBe(true);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("should fail when color is invalid", async () => {
      const result = await useCase.execute({
        ...validInput,
        color: "neon" as never,
      });

      expect(result.isFailure).toBe(true);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
