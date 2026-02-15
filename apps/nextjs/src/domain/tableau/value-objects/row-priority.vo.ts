import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const rowPriorityValues = ["low", "medium", "high", "critical"] as const;
export type RowPriorityValue = (typeof rowPriorityValues)[number];

const validValues: ReadonlySet<string> = new Set(rowPriorityValues);

const schema = z
  .string()
  .refine(
    (val) => validValues.has(val),
    "Priority must be 'low', 'medium', 'high' or 'critical'",
  );

export class RowPriority extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid row priority");
    }
    return Result.ok(result.data);
  }
}
