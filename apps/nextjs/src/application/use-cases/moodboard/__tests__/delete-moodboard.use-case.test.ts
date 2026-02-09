import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IDeleteMoodboardInputDto } from "@/application/dto/moodboard/delete-moodboard.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IMoodboardRepository } from "@/application/ports/moodboard-repository.port";
import type { IStorageProvider } from "@/application/ports/storage.provider.port";
import type { MoodboardDeletedEvent } from "@/domain/moodboard/events/moodboard-deleted.event";
import { Moodboard } from "@/domain/moodboard/moodboard.aggregate";
import { Pin } from "@/domain/moodboard/pin.entity";
import { HexColor } from "@/domain/moodboard/value-objects/hex-color.vo";
import { MoodboardTitle } from "@/domain/moodboard/value-objects/moodboard-title.vo";
import {
  PinType,
  type PinTypeValue,
} from "@/domain/moodboard/value-objects/pin-type.vo";
import { DeleteMoodboardUseCase } from "../delete-moodboard.use-case";

const IMAGE_URL = "https://pub-xxx.r2.dev/moodboard/user-123/photo.jpg";

const createImagePin = (position = 0): Pin => {
  const type = "image" as PinTypeValue;
  return Pin.create({
    type: PinType.create(type).getValue() as PinType,
    imageUrl: Option.some(IMAGE_URL),
    color: Option.none(),
    position,
  });
};

const createColorPin = (position = 1): Pin => {
  const type = "color" as PinTypeValue;
  const color: string = "#FF5733";
  return Pin.create({
    type: PinType.create(type).getValue() as PinType,
    imageUrl: Option.none(),
    color: Option.some(HexColor.create(color).getValue() as HexColor),
    position,
  });
};

const createMoodboard = (pins: Pin[] = [], userId = "user-123"): Moodboard => {
  const titleValue: string = "Test Board";
  const title = MoodboardTitle.create(titleValue).getValue() as MoodboardTitle;
  const moodboard = Moodboard.create({ userId, title }).getValue();
  for (const pin of pins) {
    moodboard.addPin(pin);
  }
  moodboard.clearEvents();
  return moodboard;
};

describe("DeleteMoodboardUseCase", () => {
  let useCase: DeleteMoodboardUseCase;
  let mockMoodboardRepo: IMoodboardRepository;
  let mockEventDispatcher: IEventDispatcher;
  let mockStorageProvider: IStorageProvider;

  const validInput: IDeleteMoodboardInputDto = {
    moodboardId: new UUID().value.toString(),
    userId: "user-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockMoodboardRepo = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(Result.ok(undefined)),
      findById: vi
        .fn()
        .mockResolvedValue(Result.ok(Option.some(createMoodboard()))),
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
    useCase = new DeleteMoodboardUseCase(
      mockMoodboardRepo,
      mockStorageProvider,
      mockEventDispatcher,
    );
  });

  describe("happy path", () => {
    it("should delete moodboard with no pins", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(validInput.moodboardId);
      expect(mockMoodboardRepo.delete).toHaveBeenCalledOnce();
      expect(mockStorageProvider.delete).not.toHaveBeenCalled();
    });

    it("should add MoodboardDeletedEvent to the moodboard", async () => {
      const moodboard = createMoodboard();
      vi.mocked(mockMoodboardRepo.findById).mockResolvedValue(
        Result.ok(Option.some(moodboard)),
      );

      await useCase.execute(validInput);

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      expect(events).toHaveLength(1);
      const event = events[0] as unknown as MoodboardDeletedEvent;
      expect(event.type).toBe("MoodboardDeleted");
      expect(event.userId).toBe("user-123");
    });

    it("should delete moodboard with mixed pins and cleanup image R2 only", async () => {
      const imagePin = createImagePin();
      const colorPin = createColorPin();

      vi.mocked(mockMoodboardRepo.findById).mockResolvedValue(
        Result.ok(Option.some(createMoodboard([imagePin, colorPin]))),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(mockStorageProvider.delete).toHaveBeenCalledOnce();
      expect(mockStorageProvider.delete).toHaveBeenCalledWith(
        "moodboard/user-123/photo.jpg",
      );
      expect(mockMoodboardRepo.delete).toHaveBeenCalledOnce();
    });
  });

  describe("ownership", () => {
    it("should fail when moodboard belongs to different user", async () => {
      const result = await useCase.execute({
        ...validInput,
        userId: "other-user",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Forbidden");
      expect(mockMoodboardRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("not found", () => {
    it("should fail when moodboard does not exist", async () => {
      vi.mocked(mockMoodboardRepo.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Moodboard not found");
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      vi.mocked(mockMoodboardRepo.delete).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should continue even if R2 cleanup fails", async () => {
      const imagePin = createImagePin();

      vi.mocked(mockMoodboardRepo.findById).mockResolvedValue(
        Result.ok(Option.some(createMoodboard([imagePin]))),
      );
      vi.mocked(mockStorageProvider.delete).mockRejectedValue(
        new Error("R2 error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(mockMoodboardRepo.delete).toHaveBeenCalledOnce();
    });
  });
});
