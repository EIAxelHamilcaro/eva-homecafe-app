import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z
  .string()
  .min(1, "Post content cannot be empty")
  .max(50000, "Post content exceeds maximum length")
  .refine(
    (val) => val.replace(/<[^>]*>/g, "").trim().length > 0,
    "Post content cannot be empty",
  );

export class PostContent extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid post content");
    }
    return Result.ok(result.data);
  }
}
