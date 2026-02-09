import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IDeletePinInputDto } from "@/application/dto/moodboard/delete-pin.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IMoodboardRepository } from "@/application/ports/moodboard-repository.port";
import type { IStorageProvider } from "@/application/ports/storage.provider.port";
import type { PinRemovedEvent } from "@/domain/moodboard/events/pin-removed.event";
import { Moodboard } from "@/domain/moodboard/moodboard.aggregate";
import { Pin } from "@/domain/moodboard/pin.entity";
import { HexColor } from "@/domain/moodboard/value-objects/hex-color.vo";
import { MoodboardTitle } from "@/domain/moodboard/value-objects/moodboard-title.vo";
import {
  PinType,
  type PinTypeValue,
} from "@/domain/moodboard/value-objects/pin-type.vo";
import { DeletePinUseCase } from "../delete-pin.use-case";

const IMAGE_URL = "https://pub-xxx.r2.dev/moodboard/user-123/photo.jpg";

const createImagePin = (): Pin => {
  const type = "image" as PinTypeValue;
  return Pin.create({
    type: PinType.create(type).getValue() as PinType,
    imageUrl: Option.some(IMAGE_URL),
    color: Option.none(),
    position: 0,
  });
};

const createColorPin = (): Pin => {
  const type = "color" as PinTypeValue;
  const color: string = "#FF5733";
  return Pin.create({
    type: PinType.create(type).getValue() as PinType,
    imageUrl: Option.none(),
    color: Option.some(HexColor.create(color).getValue() as HexColor),
    position: 1,
  });
};

const createMoodboardWithPins = (
  pins: Pin[],
  userId = "user-123",
): Moodboard => {
  const titleValue: string = "Test Board";
  const title = MoodboardTitle.create(titleValue).getValue() as MoodboardTitle;
  const moodboard = Moodboard.create({ userId, title }).getValue();
  for (const pin of pins) {
    moodboard.addPin(pin);
  }
  moodboard.clearEvents();
  return moodboard;
};

describe("DeletePinUseCase", () => {
  let useCase: DeletePinUseCase;
  let mockMoodboardRepo: IMoodboardRepository;
  let mockEventDispatcher: IEventDispatcher;
  let mockStorageProvider: IStorageProvider;
  let imagePin: Pin;
  let colorPin: Pin;

  beforeEach(() => {
    vi.clearAllMocks();
    imagePin = createImagePin();
    colorPin = createColorPin();

    mockMoodboardRepo = {
      create: vi.fn(),
      update: vi.fn().mockResolvedValue(Result.ok(undefined)),
      delete: vi.fn(),
      findById: vi
        .fn()
        .mockResolvedValue(
          Result.ok(Option.some(createMoodboardWithPins([imagePin, colorPin]))),
        ),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
    } as unknown as IMoodboardRepository;

    mockStorageProvider = {
      upload: vi.fn(),
      delete: vi.fn().mockResolvedValue(Result.ok(undefined)),
      getUrl: vi.fn(),
      generatePresignedUploadUrl: vi.fn(),
    } as unknown as IStorageProvider;

    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };
    useCase = new DeletePinUseCase(
      mockMoodboardRepo,
      mockStorageProvider,
      mockEventDispatcher,
    );
  });

  describe("happy path", () => {
    it("should delete a color pin without R2 cleanup", async () => {
      const input: IDeletePinInputDto = {
        moodboardId: new UUID().value.toString(),
        pinId: colorPin.id.value.toString(),
        userId: "user-123",
      };

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(input.pinId);
      expect(mockStorageProvider.delete).not.toHaveBeenCalled();
      expect(mockMoodboardRepo.update).toHaveBeenCalledOnce();
    });

    it("should add PinRemovedEvent to the moodboard", async () => {
      const input: IDeletePinInputDto = {
        moodboardId: new UUID().value.toString(),
        pinId: colorPin.id.value.toString(),
        userId: "user-123",
      };

      await useCase.execute(input);

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      expect(events).toHaveLength(1);
      const event = events[0] as unknown as PinRemovedEvent;
      expect(event.type).toBe("PinRemoved");
      expect(event.pinId).toBe(input.pinId);
    });

    it("should delete an image pin with R2 cleanup", async () => {
      const input: IDeletePinInputDto = {
        moodboardId: new UUID().value.toString(),
        pinId: imagePin.id.value.toString(),
        userId: "user-123",
      };

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      expect(mockStorageProvider.delete).toHaveBeenCalledWith(
        "moodboard/user-123/photo.jpg",
      );
      expect(mockMoodboardRepo.update).toHaveBeenCalledOnce();
    });
  });

  describe("ownership", () => {
    it("should fail when moodboard belongs to different user", async () => {
      const input: IDeletePinInputDto = {
        moodboardId: new UUID().value.toString(),
        pinId: imagePin.id.value.toString(),
        userId: "other-user",
      };

      const result = await useCase.execute(input);

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

      const result = await useCase.execute({
        moodboardId: new UUID().value.toString(),
        pinId: imagePin.id.value.toString(),
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Moodboard not found");
    });

    it("should fail when pin does not exist in moodboard", async () => {
      const result = await useCase.execute({
        moodboardId: new UUID().value.toString(),
        pinId: new UUID().value.toString(),
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Pin not found");
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      vi.mocked(mockMoodboardRepo.update).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute({
        moodboardId: new UUID().value.toString(),
        pinId: imagePin.id.value.toString(),
        userId: "user-123",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should continue even if R2 cleanup fails", async () => {
      vi.mocked(mockStorageProvider.delete).mockRejectedValue(
        new Error("R2 error"),
      );

      const result = await useCase.execute({
        moodboardId: new UUID().value.toString(),
        pinId: imagePin.id.value.toString(),
        userId: "user-123",
      });

      expect(result.isSuccess).toBe(true);
      expect(mockMoodboardRepo.update).toHaveBeenCalledOnce();
    });
  });
});
