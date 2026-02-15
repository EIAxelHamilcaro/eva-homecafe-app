import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const EVENT_COLORS = [
  "pink",
  "green",
  "orange",
  "blue",
  "purple",
  "amber",
  "red",
  "teal",
] as const;

export type EventColorValue = (typeof EVENT_COLORS)[number];

const schema = z.enum(EVENT_COLORS);

export class EventColor extends ValueObject<EventColorValue> {
  protected validate(value: EventColorValue): Result<EventColorValue> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid event color");
    }
    return Result.ok(result.data);
  }
}
