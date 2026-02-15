import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const rowStatusValues = [
  "todo",
  "in_progress",
  "waiting",
  "done",
] as const;
export type RowStatusValue = (typeof rowStatusValues)[number];

const schema = z.string().min(1, "Status cannot be empty");

export class RowStatus extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid row status");
    }
    return Result.ok(result.data);
  }
}
