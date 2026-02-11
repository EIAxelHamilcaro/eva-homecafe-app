import {
  createPaginatedResult,
  DEFAULT_PAGINATION,
  Option,
  type PaginatedResult,
  type PaginationParams,
  Result,
} from "@packages/ddd-kit";
import {
  type DbClient,
  db,
  eq,
  count as sqlCount,
  type Transaction,
} from "@packages/drizzle";
import { pushToken as pushTokenTable } from "@packages/drizzle/schema";
import {
  pushTokenToDomain,
  pushTokenToPersistence,
} from "@/adapters/mappers/push-token.mapper";
import type { IPushTokenRepository } from "@/application/ports/push-token-repository.port";
import type { PushToken } from "@/domain/push-token/push-token.aggregate";
import type { PushTokenId } from "@/domain/push-token/push-token-id";

export class DrizzlePushTokenRepository implements IPushTokenRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(
    entity: PushToken,
    trx?: Transaction,
  ): Promise<Result<PushToken>> {
    try {
      const data = pushTokenToPersistence(entity);
      await this.getDb(trx)
        .insert(pushTokenTable)
        .values({
          ...data,
          createdAt: data.createdAt ?? new Date(),
        });
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create push token: ${error}`);
    }
  }

  async update(
    entity: PushToken,
    trx?: Transaction,
  ): Promise<Result<PushToken>> {
    try {
      const data = pushTokenToPersistence(entity);
      await this.getDb(trx)
        .update(pushTokenTable)
        .set({
          userId: data.userId,
          token: data.token,
          platform: data.platform,
        })
        .where(eq(pushTokenTable.id, String(entity.id.value)));
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update push token: ${error}`);
    }
  }

  async delete(
    id: PushTokenId,
    trx?: Transaction,
  ): Promise<Result<PushTokenId>> {
    try {
      await this.getDb(trx)
        .delete(pushTokenTable)
        .where(eq(pushTokenTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete push token: ${error}`);
    }
  }

  async findById(id: PushTokenId): Promise<Result<Option<PushToken>>> {
    try {
      const result = await db
        .select()
        .from(pushTokenTable)
        .where(eq(pushTokenTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const domainResult = pushTokenToDomain(record);
      if (domainResult.isFailure) {
        return Result.fail(domainResult.getError());
      }

      return Result.ok(Option.some(domainResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find push token by id: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<PushToken>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db.select().from(pushTokenTable).limit(pagination.limit).offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const tokens: PushToken[] = [];
      for (const record of records) {
        const domainResult = pushTokenToDomain(record);
        if (domainResult.isFailure) {
          return Result.fail(domainResult.getError());
        }
        tokens.push(domainResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(tokens, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(`Failed to find all push tokens: ${error}`);
    }
  }

  async findMany(
    _props: Partial<PushToken["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<PushToken>>> {
    return this.findAll(pagination);
  }

  async findBy(
    _props: Partial<PushToken["_props"]>,
  ): Promise<Result<Option<PushToken>>> {
    return Result.ok(Option.none());
  }

  async exists(id: PushTokenId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: pushTokenTable.id })
        .from(pushTokenTable)
        .where(eq(pushTokenTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check push token existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const [result] = await db
        .select({ value: sqlCount() })
        .from(pushTokenTable);
      return Result.ok(result?.value ?? 0);
    } catch (error) {
      return Result.fail(`Failed to count push tokens: ${error}`);
    }
  }

  async findByUserId(userId: string): Promise<Result<PushToken[]>> {
    try {
      const records = await db
        .select()
        .from(pushTokenTable)
        .where(eq(pushTokenTable.userId, userId));

      const tokens: PushToken[] = [];
      for (const record of records) {
        const domainResult = pushTokenToDomain(record);
        if (domainResult.isFailure) {
          return Result.fail(domainResult.getError());
        }
        tokens.push(domainResult.getValue());
      }

      return Result.ok(tokens);
    } catch (error) {
      return Result.fail(`Failed to find push tokens for user: ${error}`);
    }
  }

  async findByToken(token: string): Promise<Result<Option<PushToken>>> {
    try {
      const result = await db
        .select()
        .from(pushTokenTable)
        .where(eq(pushTokenTable.token, token))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const domainResult = pushTokenToDomain(record);
      if (domainResult.isFailure) {
        return Result.fail(domainResult.getError());
      }

      return Result.ok(Option.some(domainResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find push token: ${error}`);
    }
  }

  async deleteByToken(token: string): Promise<Result<void>> {
    try {
      await db.delete(pushTokenTable).where(eq(pushTokenTable.token, token));
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to delete push token: ${error}`);
    }
  }
}
