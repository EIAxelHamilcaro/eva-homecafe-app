import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .max(20, "Phone number must be less than 20 characters")
  .regex(/^\+?[\d\s\-().]+$/, "Invalid phone number format");

export class Phone extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = phoneSchema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid phone number");
    }
    return Result.ok(result.data);
  }
}
