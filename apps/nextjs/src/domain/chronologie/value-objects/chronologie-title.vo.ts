import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z.string().min(1).max(100);

export class ChronologieTitle extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid chronologie title");
    }
    return Result.ok(result.data);
  }
}
