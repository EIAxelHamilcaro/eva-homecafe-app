import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IUpdateCalendarEventInputDto } from "@/application/dto/calendar-event/update-calendar-event.dto";
import type { ICalendarEventRepository } from "@/application/ports/calendar-event-repository.port";
import { CalendarEvent } from "@/domain/calendar-event/calendar-event.aggregate";
import { EventColor } from "@/domain/calendar-event/value-objects/event-color.vo";
import { EventTitle } from "@/domain/calendar-event/value-objects/event-title.vo";
import { UpdateCalendarEventUseCase } from "../update-calendar-event.use-case";

const createTestEvent = (userId = "user-123"): CalendarEvent => {
  const title = EventTitle.create("Original title").getValue() as EventTitle;
  const color = EventColor.create("blue").getValue() as EventColor;
  return CalendarEvent.create({ userId, title, color, date: "2026-03-15" });
};

describe("UpdateCalendarEventUseCase", () => {
  let useCase: UpdateCalendarEventUseCase;
  let mockRepo: ICalendarEventRepository;
  let existingEvent: CalendarEvent;

  beforeEach(() => {
    vi.clearAllMocks();

    existingEvent = createTestEvent();

    mockRepo = {
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(Result.ok(undefined)),
      delete: vi.fn(),
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

    useCase = new UpdateCalendarEventUseCase(mockRepo);
  });

  const makeInput = (
    overrides: Partial<IUpdateCalendarEventInputDto> = {},
  ): IUpdateCalendarEventInputDto => ({
    eventId: existingEvent.id.value.toString(),
    userId: "user-123",
    ...overrides,
  });

  describe("happy path", () => {
    it("should update title of existing event", async () => {
      const result = await useCase.execute(
        makeInput({ title: "Updated title" }),
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().title).toBe("Updated title");
      expect(mockRepo.update).toHaveBeenCalledOnce();
    });

    it("should update color of existing event", async () => {
      const result = await useCase.execute(makeInput({ color: "pink" }));

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().color).toBe("pink");
      expect(mockRepo.update).toHaveBeenCalledOnce();
    });

    it("should update date of existing event", async () => {
      const result = await useCase.execute(makeInput({ date: "2026-04-20" }));

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().date).toBe("2026-04-20");
      expect(mockRepo.update).toHaveBeenCalledOnce();
    });
  });

  describe("not found", () => {
    it("should fail when event not found", async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(Result.ok(Option.none()));

      const result = await useCase.execute(makeInput({ title: "Nope" }));

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Event not found");
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("ownership", () => {
    it("should fail when user is not the owner", async () => {
      const result = await useCase.execute(
        makeInput({ userId: "other-user", title: "Hack" }),
      );

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Forbidden");
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("validation errors", () => {
    it("should fail when new title is invalid", async () => {
      const result = await useCase.execute(makeInput({ title: "" }));

      expect(result.isFailure).toBe(true);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when repository update fails", async () => {
      vi.mocked(mockRepo.update).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(
        makeInput({ title: "Updated title" }),
      );

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
