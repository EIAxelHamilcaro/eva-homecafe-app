import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z
  .string()
  .min(1, "Le titre est requis")
  .max(100, "Le titre ne peut pas dépasser 100 caractères");

export class EventTitle extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid event title");
    }
    return Result.ok(result.data);
  }
}
