import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const UploadContextEnum = {
  POST: "post",
  GALLERY: "gallery",
  MOODBOARD: "moodboard",
  AVATAR: "avatar",
} as const;

export type UploadContextValue =
  (typeof UploadContextEnum)[keyof typeof UploadContextEnum];

const schema = z.enum(["post", "gallery", "moodboard", "avatar"]);

export class UploadContext extends ValueObject<UploadContextValue> {
  protected validate(value: UploadContextValue): Result<UploadContextValue> {
    const result = schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(
        firstIssue?.message ??
          "Invalid upload context. Must be one of: post, gallery, moodboard, avatar",
      );
    }
    return Result.ok(result.data);
  }
}
