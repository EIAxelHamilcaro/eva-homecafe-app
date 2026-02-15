import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IDeleteCalendarEventInputDto } from "@/application/dto/calendar-event/delete-calendar-event.dto";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";
import { CalendarEvent } from "@/domain/calendar-event/calendar-event.aggregate";
import { EventColor } from "@/domain/calendar-event/value-objects/event-color.vo";
import { EventTitle } from "@/domain/calendar-event/value-objects/event-title.vo";
import { DeleteCalendarEventUseCase } from "../delete-calendar-event.use-case";

const createTestEvent = (userId = "user-123"): CalendarEvent => {
  const title = EventTitle.create("Test event").getValue() as EventTitle;
  const color = EventColor.create("blue").getValue() as EventColor;
  return CalendarEvent.create({ userId, title, color, date: "2026-03-15" });
};

describe("DeleteCalendarEventUseCase", () => {
  let useCase: DeleteCalendarEventUseCase;
  let mockRepo: ICalendarEventRepository;
  let existingEvent: CalendarEvent;

  beforeEach(() => {
    vi.clearAllMocks();

    existingEvent = createTestEvent();

    mockRepo = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(Result.ok(undefined)),
      findById: vi
        .fn()
        .mockResolvedValue(Result.ok(Option.some(existingEvent))),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserIdAndMonth: vi.fn(),
    } as unknown as ICalendarEventRepository;

    useCase = new DeleteCalendarEventUseCase(mockRepo);
  });

  const makeInput = (
    overrides: Partial<IDeleteCalendarEventInputDto> = {},
  ): IDeleteCalendarEventInputDto => ({
    eventId: existingEvent.id.value.toString(),
    userId: "user-123",
    ...overrides,
  });

  describe("happy path", () => {
    it("should delete an existing event", async () => {
      const result = await useCase.execute(makeInput());

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({ deleted: true });
      expect(mockRepo.delete).toHaveBeenCalledOnce();
    });
  });

  describe("not found", () => {
    it("should fail when event not found", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(Result.ok(Option.none()));

      const result = await useCase.execute(makeInput());

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Event not found");
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("ownership", () => {
    it("should fail when user is not the owner", async () => {
      const result = await useCase.execute(makeInput({ userId: "other-user" }));

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Forbidden");
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when repository delete fails", async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(makeInput());

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
