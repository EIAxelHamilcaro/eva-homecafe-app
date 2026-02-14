import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IAddPhotoInputDto } from "@/application/dto/gallery/add-photo.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IGalleryRepository } from "@/application/ports/gallery-repository.port";
import type { PhotoUploadedEvent } from "@/domain/gallery/events/photo-uploaded.event";
import type { Photo } from "@/domain/gallery/photo.aggregate";
import { AddPhotoUseCase } from "../add-photo.use-case";

describe("AddPhotoUseCase", () => {
  let useCase: AddPhotoUseCase;
  let mockGalleryRepo: IGalleryRepository;
  let mockEventDispatcher: IEventDispatcher;

  const validInput: IAddPhotoInputDto = {
    url: "https://r2.example.com/gallery/user-123/abc123.jpg",
    filename: "vacation.jpg",
    mimeType: "image/jpeg",
    size: 2048000,
    isPrivate: true,
    userId: "user-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGalleryRepo = {
      create: vi
        .fn()
        .mockImplementation((photo: Photo) =>
          Promise.resolve(Result.ok(photo)),
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
    } as unknown as IGalleryRepository;
    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };
    useCase = new AddPhotoUseCase(mockGalleryRepo, mockEventDispatcher);
  });

  describe("happy path", () => {
    it("should add a photo without caption", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.url).toBe(validInput.url);
      expect(output.filename).toBe("vacation.jpg");
      expect(output.mimeType).toBe("image/jpeg");
      expect(output.size).toBe(2048000);
      expect(output.caption).toBeNull();
      expect(output.userId).toBe("user-123");
      expect(output.id).toBeDefined();
      expect(output.createdAt).toBeDefined();
    });

    it("should add a photo with a caption", async () => {
      const result = await useCase.execute({
        ...validInput,
        caption: "Beautiful sunset at the beach",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.caption).toBe("Beautiful sunset at the beach");
    });

    it("should persist the photo via repository", async () => {
      await useCase.execute(validInput);

      expect(mockGalleryRepo.create).toHaveBeenCalledOnce();
      expect(mockGalleryRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          _props: expect.objectContaining({
            userId: "user-123",
            url: validInput.url,
            filename: "vacation.jpg",
          }),
        }),
      );
    });

    it("should add PhotoUploadedEvent with correct payload", async () => {
      await useCase.execute(validInput);

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      expect(events).toHaveLength(1);

      const event = events[0] as unknown as PhotoUploadedEvent;
      expect(event.type).toBe("PhotoUploaded");
      expect(event.aggregateId).toBeDefined();
      expect(event.userId).toBe("user-123");
      expect(event.url).toBe(validInput.url);
    });
  });

  describe("validation errors", () => {
    it("should fail when caption exceeds 500 characters", async () => {
      const result = await useCase.execute({
        ...validInput,
        caption: "a".repeat(501),
      });

      expect(result.isFailure).toBe(true);
      expect(mockGalleryRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      vi.mocked(mockGalleryRepo.create).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });
});
