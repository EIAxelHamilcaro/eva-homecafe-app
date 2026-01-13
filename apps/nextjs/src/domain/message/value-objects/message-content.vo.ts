import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const messageContentSchema = z
  .string()
  .min(1, "Message content cannot be empty")
  .max(4000, "Message content must be less than 4000 characters")
  .transform((v) => v.trim());

export class MessageContent extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = messageContentSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid message content");
    }

    return Result.ok(result.data);
  }
}
