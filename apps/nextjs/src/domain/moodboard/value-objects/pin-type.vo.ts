import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z.enum(["image", "color"], {
  message: "Pin type must be 'image' or 'color'",
});

export type PinTypeValue = "image" | "color";

export class PinType extends ValueObject<PinTypeValue> {
  protected validate(value: PinTypeValue): Result<PinTypeValue> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid pin type");
    }
    return Result.ok(result.data);
  }
}
