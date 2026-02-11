import type { BaseRepository, Option, Result } from "@packages/ddd-kit";
import type { PushToken } from "@/domain/push-token/push-token.aggregate";

export interface IPushTokenRepository extends BaseRepository<PushToken> {
  findByUserId(userId: string): Promise<Result<PushToken[]>>;
  findByToken(token: string): Promise<Result<Option<PushToken>>>;
  deleteByToken(token: string): Promise<Result<void>>;
}
