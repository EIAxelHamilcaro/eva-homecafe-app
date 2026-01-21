import { Option, Result, UUID } from "@packages/ddd-kit";
import { db, eq, lt } from "@packages/drizzle";
import { inviteToken as inviteTokenTable } from "@packages/drizzle/schema";
import type {
  IInviteTokenRepository,
  InviteToken,
} from "@/application/ports/invite-token-repository.port";

export class DrizzleInviteTokenRepository implements IInviteTokenRepository {
  async create(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<Result<InviteToken>> {
    try {
      const id = new UUID<string>().value.toString();
      const createdAt = new Date();

      await db.insert(inviteTokenTable).values({
        id,
        userId,
        token,
        expiresAt,
        createdAt,
      });

      return Result.ok({
        id,
        userId,
        token,
        expiresAt,
        usedAt: null,
        createdAt,
      });
    } catch (error) {
      return Result.fail(`Failed to create invite token: ${error}`);
    }
  }

  async findByToken(token: string): Promise<Result<Option<InviteToken>>> {
    try {
      const result = await db
        .select()
        .from(inviteTokenTable)
        .where(eq(inviteTokenTable.token, token))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      return Result.ok(
        Option.some({
          id: record.id,
          userId: record.userId,
          token: record.token,
          expiresAt: record.expiresAt,
          usedAt: record.usedAt,
          createdAt: record.createdAt,
        }),
      );
    } catch (error) {
      return Result.fail(`Failed to find invite token: ${error}`);
    }
  }

  async markAsUsed(token: string): Promise<Result<void>> {
    try {
      await db
        .update(inviteTokenTable)
        .set({ usedAt: new Date() })
        .where(eq(inviteTokenTable.token, token));

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to mark invite token as used: ${error}`);
    }
  }

  async deleteExpired(): Promise<Result<number>> {
    try {
      const now = new Date();
      const result = await db
        .delete(inviteTokenTable)
        .where(lt(inviteTokenTable.expiresAt, now))
        .returning({ id: inviteTokenTable.id });

      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(`Failed to delete expired invite tokens: ${error}`);
    }
  }
}
