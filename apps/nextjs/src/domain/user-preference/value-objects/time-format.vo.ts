import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const TimeFormatEnum = {
  H12: "12h",
  H24: "24h",
} as const;

export type TimeFormatValue =
  (typeof TimeFormatEnum)[keyof typeof TimeFormatEnum];

const schema = z.enum(["12h", "24h"]);

export class TimeFormat extends ValueObject<TimeFormatValue> {
  protected validate(value: TimeFormatValue): Result<TimeFormatValue> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid time format");
    }
    return Result.ok(result.data);
  }
}
