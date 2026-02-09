import { z } from "zod";

export const createMoodboardInputDtoSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or fewer"),
  userId: z.string().min(1, "User ID is required"),
});

export type ICreateMoodboardInputDto = z.infer<
  typeof createMoodboardInputDtoSchema
>;

export const createMoodboardOutputDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  userId: z.string(),
  createdAt: z.string(),
});

export type ICreateMoodboardOutputDto = z.infer<
  typeof createMoodboardOutputDtoSchema
>;
