import { z } from "zod";

export const evaluateAchievementInputDtoSchema = z.object({
  userId: z.string().min(1),
  eventType: z.string().min(1),
});

export type IEvaluateAchievementInputDto = z.infer<
  typeof evaluateAchievementInputDtoSchema
>;

export interface IEvaluateAchievementOutputDto {
  newRewards: {
    id: string;
    achievementKey: string;
    achievementType: "sticker" | "badge";
    name: string;
  }[];
}
