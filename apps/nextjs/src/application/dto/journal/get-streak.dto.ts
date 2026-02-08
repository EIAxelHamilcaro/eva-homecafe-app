import { z } from "zod";

export const getStreakInputDtoSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type IGetStreakInputDto = z.infer<typeof getStreakInputDtoSchema>;

export const getStreakOutputDtoSchema = z.object({
  currentStreak: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
  lastPostDate: z.string().nullable(),
});

export type IGetStreakOutputDto = z.infer<typeof getStreakOutputDtoSchema>;
