import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z
  .number()
  .int("Mood intensity must be an integer")
  .min(1, "Mood intensity must be at least 1")
  .max(10, "Mood intensity must be at most 10");

export class MoodIntensity extends ValueObject<number> {
  protected validate(value: number): Result<number> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid mood intensity");
    }
    return Result.ok(result.data);
  }
}
