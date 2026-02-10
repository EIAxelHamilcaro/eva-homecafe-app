import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const ThemeModeEnum = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export type ThemeModeValue = (typeof ThemeModeEnum)[keyof typeof ThemeModeEnum];

const schema = z.enum(["light", "dark", "system"]);

export class ThemeMode extends ValueObject<ThemeModeValue> {
  protected validate(value: ThemeModeValue): Result<ThemeModeValue> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid theme mode");
    }
    return Result.ok(result.data);
  }
}
