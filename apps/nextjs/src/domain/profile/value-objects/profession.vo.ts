import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const professionSchema = z
  .string()
  .min(1, "Profession is required")
  .max(100, "Profession must be less than 100 characters");

export class Profession extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = professionSchema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid profession");
    }
    return Result.ok(result.data);
  }
}
