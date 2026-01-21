import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const bioSchema = z.string().max(500, "Bio must be less than 500 characters");

export class Bio extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = bioSchema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid bio");
    }
    return Result.ok(result.data);
  }
}
