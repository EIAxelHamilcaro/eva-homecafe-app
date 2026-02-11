import { Result, UUID } from "@packages/ddd-kit";
import type { pushToken as pushTokenTable } from "@packages/drizzle/schema";
import { PushToken } from "@/domain/push-token/push-token.aggregate";
import { PushTokenId } from "@/domain/push-token/push-token-id";

type PushTokenRecord = typeof pushTokenTable.$inferSelect;

type PushTokenPersistence = Omit<PushTokenRecord, "createdAt"> & {
  createdAt?: Date;
};

export function pushTokenToDomain(record: PushTokenRecord): Result<PushToken> {
  return Result.ok(
    PushToken.reconstitute(
      {
        userId: record.userId,
        token: record.token,
        platform: record.platform,
        createdAt: record.createdAt,
      },
      PushTokenId.create(new UUID(record.id)),
    ),
  );
}

export function pushTokenToPersistence(
  pushToken: PushToken,
): PushTokenPersistence {
  return {
    id: pushToken.id.value.toString(),
    userId: pushToken.get("userId"),
    token: pushToken.get("token"),
    platform: pushToken.get("platform"),
    createdAt: pushToken.get("createdAt"),
  };
}
