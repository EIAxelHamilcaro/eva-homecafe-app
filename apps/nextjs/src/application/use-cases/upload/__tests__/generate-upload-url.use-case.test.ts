import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IGenerateUploadUrlInputDto } from "@/application/dto/upload/generate-upload-url.dto";
import type { IStorageProvider } from "@/application/ports/storage.provider.port";
import { GenerateUploadUrlUseCase } from "../generate-upload-url.use-case";

describe("GenerateUploadUrlUseCase", () => {
  let useCase: GenerateUploadUrlUseCase;
  let mockStorageProvider: IStorageProvider;

  const validInput: IGenerateUploadUrlInputDto = {
    context: "post",
    filename: "photo.jpg",
    mimeType: "image/jpeg",
    size: 1024 * 1024,
    userId: "user-123",
  };

  const mockPresignedOutput = {
    uploadUrl: "https://r2.example.com/presigned-url",
    fileUrl: "https://cdn.example.com/post/user-123/abc.jpg",
    key: "post/user-123/abc.jpg",
    expiresAt: new Date("2026-02-08T12:00:00Z"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorageProvider = {
      upload: vi.fn(),
      delete: vi.fn(),
      getUrl: vi.fn(),
      generatePresignedUploadUrl: vi.fn(),
    } as unknown as IStorageProvider;
    useCase = new GenerateUploadUrlUseCase(mockStorageProvider);
  });

  describe("happy path", () => {
    it("should generate a presigned upload URL for a valid post context", async () => {
      vi.mocked(
        mockStorageProvider.generatePresignedUploadUrl,
      ).mockResolvedValue(Result.ok(mockPresignedOutput));

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.uploadUrl).toBe(mockPresignedOutput.uploadUrl);
      expect(output.fileUrl).toBe(mockPresignedOutput.fileUrl);
      expect(output.key).toBe(mockPresignedOutput.key);
      expect(output.expiresAt).toBe(
        mockPresignedOutput.expiresAt.toISOString(),
      );
    });

    it("should generate a presigned URL for gallery context", async () => {
      vi.mocked(
        mockStorageProvider.generatePresignedUploadUrl,
      ).mockResolvedValue(Result.ok(mockPresignedOutput));

      const result = await useCase.execute({
        ...validInput,
        context: "gallery",
      });

      expect(result.isSuccess).toBe(true);
      expect(
        mockStorageProvider.generatePresignedUploadUrl,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          mimeType: "image/jpeg",
        }),
      );
    });

    it("should generate a presigned URL for moodboard context", async () => {
      vi.mocked(
        mockStorageProvider.generatePresignedUploadUrl,
      ).mockResolvedValue(Result.ok(mockPresignedOutput));

      const result = await useCase.execute({
        ...validInput,
        context: "moodboard",
      });

      expect(result.isSuccess).toBe(true);
    });

    it("should generate a presigned URL for avatar context", async () => {
      vi.mocked(
        mockStorageProvider.generatePresignedUploadUrl,
      ).mockResolvedValue(Result.ok(mockPresignedOutput));

      const result = await useCase.execute({
        ...validInput,
        context: "avatar",
      });

      expect(result.isSuccess).toBe(true);
    });

    it("should generate a storage key with context/userId/uuid.ext format", async () => {
      vi.mocked(
        mockStorageProvider.generatePresignedUploadUrl,
      ).mockResolvedValue(Result.ok(mockPresignedOutput));

      await useCase.execute(validInput);

      expect(
        mockStorageProvider.generatePresignedUploadUrl,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.stringMatching(/^post\/user-123\/[a-f0-9-]+\.jpg$/),
          mimeType: "image/jpeg",
          size: 1024 * 1024,
          expiresIn: 900,
        }),
      );
    });

    it("should accept PNG files", async () => {
      vi.mocked(
        mockStorageProvider.generatePresignedUploadUrl,
      ).mockResolvedValue(Result.ok(mockPresignedOutput));

      const result = await useCase.execute({
        ...validInput,
        filename: "image.png",
        mimeType: "image/png",
      });

      expect(result.isSuccess).toBe(true);
    });

    it("should accept GIF files", async () => {
      vi.mocked(
        mockStorageProvider.generatePresignedUploadUrl,
      ).mockResolvedValue(Result.ok(mockPresignedOutput));

      const result = await useCase.execute({
        ...validInput,
        filename: "animation.gif",
        mimeType: "image/gif",
      });

      expect(result.isSuccess).toBe(true);
    });

    it("should accept WebP files", async () => {
      vi.mocked(
        mockStorageProvider.generatePresignedUploadUrl,
      ).mockResolvedValue(Result.ok(mockPresignedOutput));

      const result = await useCase.execute({
        ...validInput,
        filename: "photo.webp",
        mimeType: "image/webp",
      });

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("validation errors", () => {
    it("should fail when context is invalid", async () => {
      const result = await useCase.execute({
        ...validInput,
        context: "invalid" as "post",
      });

      expect(result.isFailure).toBe(true);
      expect(
        mockStorageProvider.generatePresignedUploadUrl,
      ).not.toHaveBeenCalled();
    });

    it("should fail when mimeType is not an image type", async () => {
      const result = await useCase.execute({
        ...validInput,
        mimeType: "application/pdf" as "image/jpeg",
      });

      expect(result.isFailure).toBe(true);
      expect(
        mockStorageProvider.generatePresignedUploadUrl,
      ).not.toHaveBeenCalled();
    });

    it("should fail when file size exceeds 10MB", async () => {
      const result = await useCase.execute({
        ...validInput,
        size: 11 * 1024 * 1024,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("10MB");
      expect(
        mockStorageProvider.generatePresignedUploadUrl,
      ).not.toHaveBeenCalled();
    });

    it("should fail when filename is empty", async () => {
      const result = await useCase.execute({
        ...validInput,
        filename: "",
      });

      expect(result.isFailure).toBe(true);
      expect(
        mockStorageProvider.generatePresignedUploadUrl,
      ).not.toHaveBeenCalled();
    });

    it("should fail when file size is zero", async () => {
      const result = await useCase.execute({
        ...validInput,
        size: 0,
      });

      expect(result.isFailure).toBe(true);
      expect(
        mockStorageProvider.generatePresignedUploadUrl,
      ).not.toHaveBeenCalled();
    });

    it("should fail when file size is negative", async () => {
      const result = await useCase.execute({
        ...validInput,
        size: -100,
      });

      expect(result.isFailure).toBe(true);
      expect(
        mockStorageProvider.generatePresignedUploadUrl,
      ).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when storage provider returns error", async () => {
      vi.mocked(
        mockStorageProvider.generatePresignedUploadUrl,
      ).mockResolvedValue(Result.fail("Storage service unavailable"));

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Storage service unavailable");
    });
  });
});
