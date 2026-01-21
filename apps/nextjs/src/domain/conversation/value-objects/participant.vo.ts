import { Option, Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const userIdSchema = z.string().min(1, "User ID is required");
const dateSchema = z.date();

export interface IParticipantProps {
  userId: string;
  joinedAt: Date;
  lastReadAt: Option<Date>;
}

export class Participant extends ValueObject<IParticipantProps> {
  get userId(): string {
    return this._value.userId;
  }

  get joinedAt(): Date {
    return this._value.joinedAt;
  }

  get lastReadAt(): Option<Date> {
    return this._value.lastReadAt;
  }

  protected validate(value: IParticipantProps): Result<IParticipantProps> {
    const userIdResult = userIdSchema.safeParse(value.userId);
    if (!userIdResult.success) {
      return Result.fail(
        userIdResult.error.issues[0]?.message ?? "Invalid user ID",
      );
    }

    const joinedAtResult = dateSchema.safeParse(value.joinedAt);
    if (!joinedAtResult.success) {
      return Result.fail(
        joinedAtResult.error.issues[0]?.message ?? "Invalid joinedAt date",
      );
    }

    if (value.lastReadAt.isSome()) {
      const lastReadAtResult = dateSchema.safeParse(value.lastReadAt.unwrap());
      if (!lastReadAtResult.success) {
        return Result.fail(
          lastReadAtResult.error.issues[0]?.message ??
            "Invalid lastReadAt date",
        );
      }
    }

    return Result.ok({
      userId: userIdResult.data,
      joinedAt: joinedAtResult.data,
      lastReadAt: value.lastReadAt,
    });
  }

  static createNew(userId: string): Result<Participant> {
    return Participant.create({
      userId,
      joinedAt: new Date(),
      lastReadAt: Option.none<Date>(),
    });
  }

  withLastReadAt(date: Date): Result<Participant> {
    return Participant.create({
      ...this._value,
      lastReadAt: Option.some(date),
    });
  }
}
