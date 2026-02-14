import { z } from "zod";

export const addPhotoInputDtoSchema = z.object({
  url: z.string().url("Invalid image URL"),
  filename: z.string().min(1, "Filename is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  size: z.number().int().positive("Size must be positive"),
  caption: z
    .string()
    .max(500, "Caption must be 500 characters or fewer")
    .optional(),
  isPrivate: z.boolean().default(true),
  userId: z.string().min(1, "User ID is required"),
});

export type IAddPhotoInputDto = z.infer<typeof addPhotoInputDtoSchema>;

export const addPhotoOutputDtoSchema = z.object({
  id: z.string(),
  url: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
  caption: z.string().nullable(),
  isPrivate: z.boolean(),
  userId: z.string(),
  createdAt: z.string(),
});

export type IAddPhotoOutputDto = z.infer<typeof addPhotoOutputDtoSchema>;
