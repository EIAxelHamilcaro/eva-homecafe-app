import { z } from "zod";
import { emotionCategorySchema } from "@/domain/emotion/value-objects/emotion-category.vo";

export const recordEmotionInputDtoSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  category: emotionCategorySchema,
  emotionDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

export type IRecordEmotionInputDto = z.infer<
  typeof recordEmotionInputDtoSchema
>;

export const recordEmotionOutputDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  category: z.string(),
  isUpdate: z.boolean(),
});

export type IRecordEmotionOutputDto = z.infer<
  typeof recordEmotionOutputDtoSchema
>;
