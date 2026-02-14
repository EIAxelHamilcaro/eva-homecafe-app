import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IDeletePhotoInputDto } from "@/application/dto/gallery/delete-photo.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IGalleryRepository } from "@/application/ports/gallery-repository.port";
import type { IStorageProvider } from "@/application/ports/storage.provider.port";
import type { PhotoDeletedEvent } from "@/domain/gallery/events/photo-deleted.event";
import { Photo } from "@/domain/gallery/photo.aggregate";
import type { PhotoId } from "@/domain/gallery/photo-id";
import { DeletePhotoUseCase } from "../delete-photo.use-case";

function createMockPhoto(overrides?: Partial<{ userId: string }>) {
  return Photo.create({
    userId: overrides?.userId ?? "user-123",
    url: "https://pub-xxx.r2.dev/gallery/user-123/abc.jpg",
    filename: "abc.jpg",
    mimeType: "image/jpeg",
    size: 1024,
    caption: Option.none(),
    isPrivate: true,
  }).getValue();
}

describe("DeletePhotoUseCase", () => {
  let useCase: DeletePhotoUseCase;
  let mockGalleryRepo: IGalleryRepository;
  let mockEventDispatcher: IEventDispatcher;
  let mockStorageProvider: IStorageProvider;
  let mockPhoto: Photo;

  const validInput: IDeletePhotoInputDto = {
    photoId: "photo-456",
    userId: "user-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPhoto = createMockPhoto();
    mockGalleryRepo = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi
        .fn()
        .mockImplementation((id: PhotoId) => Promise.resolve(Result.ok(id))),
      findById: vi.fn().mockResolvedValue(Result.ok(Option.some(mockPhoto))),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
    } as unknown as IGalleryRepository;
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
    useCase = new DeletePhotoUseCase(
      mockGalleryRepo,
      mockStorageProvider,
      mockEventDispatcher,
    );
  });

  describe("happy path", () => {
    it("should delete an owned photo", async () => {
      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe("photo-456");
    });

    it("should delete from R2 storage before DB", async () => {
      await useCase.execute(validInput);

      expect(mockStorageProvider.delete).toHaveBeenCalledOnce();
      expect(mockStorageProvider.delete).toHaveBeenCalledWith(
        "gallery/user-123/abc.jpg",
      );
    });

    it("should call repository delete", async () => {
      await useCase.execute(validInput);

      expect(mockGalleryRepo.delete).toHaveBeenCalledOnce();
    });

    it("should add PhotoDeletedEvent with correct payload", async () => {
      await useCase.execute(validInput);

      const events = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0] as unknown[];
      const event = events.find(
        (e: unknown) => (e as { type: string }).type === "PhotoDeleted",
      ) as unknown as PhotoDeletedEvent;
      expect(event).toBeDefined();
      expect(event.userId).toBe("user-123");
      expect(event.url).toBe("https://pub-xxx.r2.dev/gallery/user-123/abc.jpg");
    });
  });

  describe("authorization", () => {
    it("should fail when user does not own the photo", async () => {
      const result = await useCase.execute({
        ...validInput,
        userId: "other-user",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Forbidden");
      expect(mockStorageProvider.delete).not.toHaveBeenCalled();
      expect(mockGalleryRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("not found", () => {
    it("should fail when photo does not exist", async () => {
      vi.mocked(mockGalleryRepo.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Photo not found");
      expect(mockStorageProvider.delete).not.toHaveBeenCalled();
      expect(mockGalleryRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("malformed data", () => {
    it("should fail when photo URL is malformed", async () => {
      const badPhoto = Photo.create({
        userId: "user-123",
        url: "not-a-valid-url",
        filename: "bad.jpg",
        mimeType: "image/jpeg",
        size: 1024,
        caption: Option.none(),
        isPrivate: true,
      }).getValue();

      vi.mocked(mockGalleryRepo.findById).mockResolvedValue(
        Result.ok(Option.some(badPhoto)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Invalid photo URL");
      expect(mockStorageProvider.delete).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when repository findById returns error", async () => {
      vi.mocked(mockGalleryRepo.findById).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });

    it("should fail when storage delete returns error", async () => {
      vi.mocked(mockStorageProvider.delete).mockResolvedValue(
        Result.fail("Storage error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Storage error");
      expect(mockGalleryRepo.delete).not.toHaveBeenCalled();
    });

    it("should fail when repository delete returns error", async () => {
      vi.mocked(mockGalleryRepo.delete).mockResolvedValue(
        Result.fail("Database delete error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database delete error");
    });
  });
});
