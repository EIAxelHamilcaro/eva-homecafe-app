import { z } from "zod";

export const getMoodWeekOutputDtoSchema = z.object({
  entries: z.array(
    z.object({
      date: z.string(),
      dayOfWeek: z.string(),
      category: z.string(),
      intensity: z.number(),
    }),
  ),
});

export type IGetMoodWeekOutputDto = z.infer<typeof getMoodWeekOutputDtoSchema>;
