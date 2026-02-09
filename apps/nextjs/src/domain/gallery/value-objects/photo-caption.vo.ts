import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z
  .string()
  .min(1, "Caption must not be empty")
  .max(500, "Caption must be 500 characters or fewer");

export class PhotoCaption extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid caption");
    }
    return Result.ok(result.data);
  }
}
