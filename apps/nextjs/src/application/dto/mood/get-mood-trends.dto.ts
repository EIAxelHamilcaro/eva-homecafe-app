import { z } from "zod";

export const getMoodTrendsOutputDtoSchema = z.object({
  months: z.array(
    z.object({
      month: z.string(),
      dominantCategory: z.string(),
      averageIntensity: z.number(),
      entryCount: z.number(),
    }),
  ),
});

export type IGetMoodTrendsOutputDto = z.infer<
  typeof getMoodTrendsOutputDtoSchema
>;
