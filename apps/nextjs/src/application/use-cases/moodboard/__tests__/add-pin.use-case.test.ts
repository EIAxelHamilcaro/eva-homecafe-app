import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IAddPinInputDto } from "@/application/dto/moodboard/add-pin.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IMoodboardRepository } from "@/application/ports/moodboard-repository.port";
import type { PinAddedEvent } from "@/domain/moodboard/events/pin-added.event";
import { Moodboard } from "@/domain/moodboard/moodboard.aggregate";
import { Pin } from "@/domain/moodboard/pin.entity";
import { MoodboardTitle } from "@/domain/moodboard/value-objects/moodboard-title.vo";
import {
  PinType,
  type PinTypeValue,
} from "@/domain/moodboard/value-objects/pin-type.vo";
import { AddPinUseCase } from "../add-pin.use-case";

const createMockMoodboard = (userId = "user-123"): Moodboard => {
  const titleValue: string = "Test Board";
  const title = MoodboardTitle.create(titleValue).getValue() as MoodboardTitle;
  const moodboard = Moodboard.create({ userId, title }).getValue();
  moodboard.clearEvents();
  return moodboard;
};

describe("AddPinUseCase", () => {
  let useCase: AddPinUseCase;
  let mockMoodboardRepo: IMoodboardRepository;
  let mockEventDispatcher: IEventDispatcher;

  const imageInput: IAddPinInputDto = {
    moodboardId: new UUID().value.toString(),
    userId: "user-123",
    type: "image",
    imageUrl: "https://pub-xxx.r2.dev/moodboard/user-123/photo.jpg",
  };

  const colorInput: IAddPinInputDto = {
    moodboardId: new UUID().value.toString(),
    userId: "user-123",
    type: "color",
    color: "#FF5733",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMoodboardRepo = {
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(Result.ok(undefined)),
      delete: vi.fn(),
      findById: vi
        .fn()
        .mockResolvedValue(Result.ok(Option.some(createMockMoodboard()))),
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
    useCase = new AddPinUseCase(mockMoodboardRepo, mockEventDispatcher);
  });

  describe("happy path", () => {
    it("should add an image pin successfully", async () => {
      const result = await useCase.execute(imageInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.type).toBe("image");
      expect(output.imageUrl).toBe(imageInput.imageUrl);
      expect(output.color).toBeNull();
      expect(output.position).toBe(0);
      expect(output.id).toBeDefined();
      expect(output.createdAt).toBeDefined();
    });

    it("should add a color pin successfully", async () => {
      const result = await useCase.execute(colorInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.type).toBe("color");
      expect(output.color).toBe("#FF5733");
      expect(output.imageUrl).toBeNull();
      expect(output.position).toBe(0);
    });

    it("should add PinAddedEvent to the moodboard", async () => {
      await useCase.execute(imageInput);

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      expect(events).toHaveLength(1);
      const event = events[0] as unknown as PinAddedEvent;
      expect(event.type).toBe("PinAdded");
      expect(event.pinType).toBe("image");
    });
  });

  describe("validation errors", () => {
    it("should fail when type is image but no imageUrl provided", async () => {
      const result = await useCase.execute({
        ...imageInput,
        imageUrl: undefined,
      } as unknown as IAddPinInputDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Image URL is required for image pins");
      expect(mockMoodboardRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when type is color but no color provided", async () => {
      const result = await useCase.execute({
        ...colorInput,
        color: undefined,
      } as unknown as IAddPinInputDto);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Color is required for color pins");
      expect(mockMoodboardRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when invalid hex color format", async () => {
      const result = await useCase.execute({
        ...colorInput,
        color: "not-a-hex",
      } as IAddPinInputDto);

      expect(result.isFailure).toBe(true);
      expect(mockMoodboardRepo.update).not.toHaveBeenCalled();
    });

    it("should fail when moodboard already has 50 pins", async () => {
      const moodboard = createMockMoodboard();
      const type = "color" as PinTypeValue;
      for (let i = 0; i < 50; i++) {
        const pin = Pin.create({
          type: PinType.create(type).getValue() as PinType,
          imageUrl: Option.none(),
          color: Option.none(),
          position: i,
        });
        moodboard.addPin(pin);
      }
      moodboard.clearEvents();

      vi.mocked(mockMoodboardRepo.findById).mockResolvedValue(
        Result.ok(Option.some(moodboard)),
      );

      const result = await useCase.execute(colorInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("cannot have more than 50 pins");
      expect(mockMoodboardRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("ownership", () => {
    it("should fail when moodboard belongs to different user", async () => {
      const result = await useCase.execute({
        ...imageInput,
        userId: "other-user",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Forbidden");
      expect(mockMoodboardRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("not found", () => {
    it("should fail when moodboard does not exist", async () => {
      vi.mocked(mockMoodboardRepo.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(imageInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Moodboard not found");
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      vi.mocked(mockMoodboardRepo.update).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(imageInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
