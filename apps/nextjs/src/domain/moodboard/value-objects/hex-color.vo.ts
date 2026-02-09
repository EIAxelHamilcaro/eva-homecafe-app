import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z
  .string()
  .regex(
    /^#[0-9a-fA-F]{6}$/,
    "Color must be a valid hex color (e.g., #FF5733)",
  );

export class HexColor extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid hex color");
    }
    return Result.ok(result.data);
  }
}
