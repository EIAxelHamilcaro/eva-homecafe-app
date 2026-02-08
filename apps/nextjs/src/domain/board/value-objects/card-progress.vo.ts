import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z
  .number()
  .int()
  .min(0, "Progress must be at least 0")
  .max(100, "Progress must be at most 100");

export class CardProgress extends ValueObject<number> {
  protected validate(value: number): Result<number> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid progress value");
    }
    return Result.ok(result.data);
  }
}
