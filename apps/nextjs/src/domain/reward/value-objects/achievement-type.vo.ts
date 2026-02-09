import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z.enum(["sticker", "badge"], {
  message: "Achievement type must be 'sticker' or 'badge'",
});

export type AchievementTypeValue = "sticker" | "badge";

export class AchievementType extends ValueObject<AchievementTypeValue> {
  protected validate(
    value: AchievementTypeValue,
  ): Result<AchievementTypeValue> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid achievement type");
    }
    return Result.ok(result.data);
  }
}
