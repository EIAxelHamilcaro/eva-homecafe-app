import type { Option, Result } from "@packages/ddd-kit";

export interface InviteToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface IInviteTokenRepository {
  create(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<Result<InviteToken>>;
  findByToken(token: string): Promise<Result<Option<InviteToken>>>;
  markAsUsed(token: string): Promise<Result<void>>;
  deleteExpired(): Promise<Result<number>>;
}
