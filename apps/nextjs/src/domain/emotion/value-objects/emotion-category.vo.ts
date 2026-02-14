import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const EMOTION_CATEGORIES = [
  "calme",
  "enervement",
  "excitation",
  "anxiete",
  "tristesse",
  "bonheur",
  "ennui",
  "nervosite",
  "productivite",
] as const;

export type EmotionCategoryValue = (typeof EMOTION_CATEGORIES)[number];

const validValues: ReadonlySet<string> = new Set(EMOTION_CATEGORIES);

export const emotionCategorySchema = z
  .string()
  .refine(
    (val) => validValues.has(val),
    `Invalid emotion category. Must be one of: ${EMOTION_CATEGORIES.join(", ")}`,
  );

export class EmotionCategory extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = emotionCategorySchema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid emotion category");
    }
    return Result.ok(result.data);
  }
}
