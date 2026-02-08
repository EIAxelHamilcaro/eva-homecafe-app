import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z
  .string()
  .min(1, "Board title cannot be empty")
  .max(100, "Board title exceeds maximum length");

export class BoardTitle extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid board title");
    }
    return Result.ok(result.data);
  }
}
