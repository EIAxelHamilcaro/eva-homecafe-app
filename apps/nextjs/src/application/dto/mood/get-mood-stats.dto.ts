import { z } from "zod";

export const getMoodStatsInputDtoSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  period: z.enum(["week", "6months"]),
});

export type IGetMoodStatsInputDto = z.infer<typeof getMoodStatsInputDtoSchema>;

export const getMoodStatsOutputDtoSchema = z.object({
  categoryDistribution: z.array(
    z.object({
      category: z.string(),
      count: z.number(),
      percentage: z.number(),
    }),
  ),
  averageIntensity: z.number(),
  totalEntries: z.number(),
  dominantMood: z.string().nullable(),
});

export type IGetMoodStatsOutputDto = z.infer<
  typeof getMoodStatsOutputDtoSchema
>;
