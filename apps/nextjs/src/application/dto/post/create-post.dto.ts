import { z } from "zod";

export const createPostInputDtoSchema = z.object({
  content: z.string().min(1, "Post content is required"),
  isPrivate: z.boolean(),
  images: z
    .array(z.string().url("Invalid image URL"))
    .max(10, "Maximum 10 images allowed")
    .optional()
    .default([]),
  userId: z.string().min(1, "User ID is required"),
  createdAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional(),
});

export type ICreatePostInputDto = z.infer<typeof createPostInputDtoSchema>;

export const createPostOutputDtoSchema = z.object({
  id: z.string(),
  content: z.string(),
  isPrivate: z.boolean(),
  images: z.array(z.string()),
  userId: z.string(),
  createdAt: z.string(),
});

export type ICreatePostOutputDto = z.infer<typeof createPostOutputDtoSchema>;
