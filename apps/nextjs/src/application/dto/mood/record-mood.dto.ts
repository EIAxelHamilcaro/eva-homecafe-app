import { z } from "zod";
import { moodCategorySchema } from "@/domain/mood/value-objects/mood-category.vo";

export const recordMoodInputDtoSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  category: moodCategorySchema,
  intensity: z
    .number()
    .int("Intensity must be an integer")
    .min(1, "Intensity must be at least 1")
    .max(10, "Intensity must be at most 10"),
  moodDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional(),
});

export type IRecordMoodInputDto = z.infer<typeof recordMoodInputDtoSchema>;

export const recordMoodOutputDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  category: z.string(),
  intensity: z.number(),
  createdAt: z.string(),
  isUpdate: z.boolean(),
});

export type IRecordMoodOutputDto = z.infer<typeof recordMoodOutputDtoSchema>;
