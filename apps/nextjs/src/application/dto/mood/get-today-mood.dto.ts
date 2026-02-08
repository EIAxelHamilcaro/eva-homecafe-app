import { z } from "zod";

export const getTodayMoodInputDtoSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type IGetTodayMoodInputDto = z.infer<typeof getTodayMoodInputDtoSchema>;

export const getTodayMoodOutputDtoSchema = z
  .object({
    id: z.string(),
    category: z.string(),
    intensity: z.number(),
    createdAt: z.string(),
  })
  .nullable();

export type IGetTodayMoodOutputDto = z.infer<
  typeof getTodayMoodOutputDtoSchema
>;
