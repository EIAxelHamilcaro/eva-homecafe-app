import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type AllowedImageType,
  MAX_IMAGE_SIZE,
} from "@/application/dto/chat/upload-media.dto";
import type { IStorageProvider } from "@/application/ports/storage.provider.port";
import { UploadMediaUseCase } from "../upload-media.use-case";

describe("UploadMediaUseCase", () => {
  let useCase: UploadMediaUseCase;
  let mockStorageProvider: IStorageProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorageProvider = {
      upload: vi.fn().mockResolvedValue(
        Result.ok({
          id: "file-1",
          url: "https://cdn.example.com/file.jpg",
          filename: "photo.jpg",
          mimeType: "image/jpeg",
          size: 1024,
        }),
      ),
      delete: vi.fn(),
      getUrl: vi.fn(),
      generatePresignedUploadUrl: vi.fn(),
    } as unknown as IStorageProvider;
    useCase = new UploadMediaUseCase(mockStorageProvider);
  });

  describe("happy path", () => {
    it("should upload an image successfully", async () => {
      const result = await useCase.execute({
        file: Buffer.from("fake-image-data"),
        filename: "photo.jpg",
        mimeType: "image/jpeg",
        userId: "user-1",
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.id).toBe("file-1");
      expect(output.url).toBe("https://cdn.example.com/file.jpg");
      expect(output.mimeType).toBe("image/jpeg");
      expect(mockStorageProvider.upload).toHaveBeenCalledOnce();
      expect(mockStorageProvider.upload).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: "chat/user-1",
        }),
      );
    });
  });

  describe("validation errors", () => {
    it("should fail for invalid mime type", async () => {
      const result = await useCase.execute({
        file: Buffer.from("fake-pdf-data"),
        filename: "doc.pdf",
        mimeType: "application/pdf" as unknown as AllowedImageType,
        userId: "user-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Unsupported media type");
      expect(mockStorageProvider.upload).not.toHaveBeenCalled();
    });

    it("should fail when file exceeds maximum size", async () => {
      const largeFile = Buffer.alloc(MAX_IMAGE_SIZE + 1);

      const result = await useCase.execute({
        file: largeFile,
        filename: "huge.jpg",
        mimeType: "image/jpeg",
        userId: "user-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("exceeds maximum");
      expect(mockStorageProvider.upload).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when storageProvider.upload fails", async () => {
      mockStorageProvider.upload = vi
        .fn()
        .mockResolvedValue(Result.fail("Upload failed"));

      const result = await useCase.execute({
        file: Buffer.from("fake-image-data"),
        filename: "photo.jpg",
        mimeType: "image/jpeg",
        userId: "user-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Upload failed");
    });
  });
});
