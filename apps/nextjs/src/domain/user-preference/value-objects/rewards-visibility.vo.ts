import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const RewardsVisibilityEnum = {
  EVERYONE: "everyone",
  FRIENDS: "friends",
  NOBODY: "nobody",
} as const;

export type RewardsVisibilityValue =
  (typeof RewardsVisibilityEnum)[keyof typeof RewardsVisibilityEnum];

const schema = z.enum(["everyone", "friends", "nobody"]);

export class RewardsVisibility extends ValueObject<RewardsVisibilityValue> {
  protected validate(
    value: RewardsVisibilityValue,
  ): Result<RewardsVisibilityValue> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid rewards visibility");
    }
    return Result.ok(result.data);
  }
}
