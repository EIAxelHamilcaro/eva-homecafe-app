import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z.object({
  eventType: z.string().min(1),
  threshold: z.number().int().positive(),
  field: z.string().min(1),
});

export interface IAchievementCriteria {
  eventType: string;
  threshold: number;
  field: string;
}

export class AchievementCriteria extends ValueObject<IAchievementCriteria> {
  protected validate(
    value: IAchievementCriteria,
  ): Result<IAchievementCriteria> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid achievement criteria");
    }
    return Result.ok(result.data);
  }
}
