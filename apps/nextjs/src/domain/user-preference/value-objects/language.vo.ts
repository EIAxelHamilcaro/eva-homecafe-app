import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const LanguageEnum = {
  FR: "fr",
  EN: "en",
} as const;

export type LanguageValue = (typeof LanguageEnum)[keyof typeof LanguageEnum];

const schema = z.enum(["fr", "en"]);

export class Language extends ValueObject<LanguageValue> {
  protected validate(value: LanguageValue): Result<LanguageValue> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid language");
    }
    return Result.ok(result.data);
  }
}
