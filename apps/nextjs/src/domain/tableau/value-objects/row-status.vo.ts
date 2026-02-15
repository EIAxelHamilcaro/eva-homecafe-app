import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const rowStatusValues = [
  "todo",
  "in_progress",
  "waiting",
  "done",
] as const;
export type RowStatusValue = (typeof rowStatusValues)[number];

const validValues: ReadonlySet<string> = new Set(rowStatusValues);

const schema = z
  .string()
  .refine(
    (val) => validValues.has(val),
    "Status must be 'todo', 'in_progress', 'waiting' or 'done'",
  );

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
