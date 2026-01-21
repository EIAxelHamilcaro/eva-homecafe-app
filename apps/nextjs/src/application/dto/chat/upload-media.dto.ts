import { z } from "zod";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export const uploadMediaInputDtoSchema = z.object({
  file: z.instanceof(Buffer),
  filename: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_IMAGE_TYPES, {
    message: "Only image files are allowed (jpeg, png, gif, webp)",
  }),
  userId: z.string().min(1),
});

export const dimensionsOutputSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const uploadMediaOutputDtoSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  mimeType: z.string(),
  size: z.number().positive(),
  filename: z.string(),
  dimensions: dimensionsOutputSchema.nullable(),
});

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];
export type IUploadMediaInputDto = z.infer<typeof uploadMediaInputDtoSchema>;
export type IUploadMediaOutputDto = z.infer<typeof uploadMediaOutputDtoSchema>;
export type IDimensionsOutput = z.infer<typeof dimensionsOutputSchema>;
