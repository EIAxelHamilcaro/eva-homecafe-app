import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const displayNameSchema = z
  .string()
  .min(1, "Display name is required")
  .max(50, "Display name must be less than 50 characters");

export class DisplayName extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = displayNameSchema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid display name");
    }
    return Result.ok(result.data);
  }
}
