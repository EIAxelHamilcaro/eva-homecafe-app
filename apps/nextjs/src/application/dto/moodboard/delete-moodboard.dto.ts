import { z } from "zod";

export const deleteMoodboardInputDtoSchema = z.object({
  moodboardId: z.string().min(1, "Moodboard ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export type IDeleteMoodboardInputDto = z.infer<
  typeof deleteMoodboardInputDtoSchema
>;

export const deleteMoodboardOutputDtoSchema = z.object({
  id: z.string(),
});

export type IDeleteMoodboardOutputDto = z.infer<
  typeof deleteMoodboardOutputDtoSchema
>;
