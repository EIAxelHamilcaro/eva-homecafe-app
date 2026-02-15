import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const rowPriorityValues = ["low", "medium", "high", "critical"] as const;
export type RowPriorityValue = (typeof rowPriorityValues)[number];

const schema = z.string().min(1, "Priority cannot be empty");

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
