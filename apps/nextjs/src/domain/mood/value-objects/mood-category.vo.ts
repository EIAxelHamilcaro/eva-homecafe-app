import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const MOOD_CATEGORIES = [
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

export type MoodCategoryValue = (typeof MOOD_CATEGORIES)[number];

const validValues: ReadonlySet<string> = new Set(MOOD_CATEGORIES);

export const moodCategorySchema = z
  .string()
  .refine(
    (val) => validValues.has(val),
    `Invalid mood category. Must be one of: ${MOOD_CATEGORIES.join(", ")}`,
  );

export class MoodCategory extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = moodCategorySchema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid mood category");
    }
    return Result.ok(result.data);
  }
}
