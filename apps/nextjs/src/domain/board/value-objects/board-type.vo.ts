import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const boardTypeValues = ["todo", "kanban"] as const;
export type BoardTypeValue = (typeof boardTypeValues)[number];

const validValues: ReadonlySet<string> = new Set(boardTypeValues);

const schema = z
  .string()
  .refine(
    (val) => validValues.has(val),
    "Board type must be 'todo' or 'kanban'",
  );

export class BoardType extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid board type");
    }
    return Result.ok(result.data);
  }
}
