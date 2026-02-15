import { z } from "zod";

export const generateUploadUrlInputDtoSchema = z.object({
  context: z.enum(["post", "gallery", "moodboard", "avatar", "tableau"]),
  filename: z.string().min(1, "Filename is required"),
  mimeType: z.enum(
    [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    { message: "Unsupported file type" },
  ),
  size: z
    .number()
    .positive("File size must be positive")
    .max(20 * 1024 * 1024, "File size exceeds 20MB limit"),
  userId: z.string().min(1, "User ID is required"),
});

export type IGenerateUploadUrlInputDto = z.infer<
  typeof generateUploadUrlInputDtoSchema
>;

export const generateUploadUrlOutputDtoSchema = z.object({
  uploadUrl: z.string(),
  fileUrl: z.string(),
  key: z.string(),
  expiresAt: z.string(),
});

export type IGenerateUploadUrlOutputDto = z.infer<
  typeof generateUploadUrlOutputDtoSchema
>;
