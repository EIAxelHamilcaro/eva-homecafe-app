import {
  createPaginatedResult,
  DEFAULT_PAGINATION,
  Option,
  type PaginatedResult,
  type PaginationParams,
  Result,
} from "@packages/ddd-kit";
import {
  and,
  type DbClient,
  db,
  desc,
  eq,
  or,
  type Transaction,
} from "@packages/drizzle";
import { friendRequest as friendRequestTable } from "@packages/drizzle/schema";
import {
  friendRequestToDomain,
  friendRequestToPersistence,
} from "@/adapters/mappers/friend-request.mapper";
import type { IFriendRequestRepository } from "@/application/ports/friend-request-repository.port";
import type { FriendRequest } from "@/domain/friend/friend-request.aggregate";
import type { FriendRequestId } from "@/domain/friend/friend-request-id";
import { FriendRequestStatusEnum } from "@/domain/friend/value-objects/friend-request-status.vo";

export class DrizzleFriendRequestRepository
  implements IFriendRequestRepository
{
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(
    entity: FriendRequest,
    trx?: Transaction,
  ): Promise<Result<FriendRequest>> {
    try {
      const data = friendRequestToPersistence(entity);
      await this.getDb(trx)
        .insert(friendRequestTable)
        .values({
          ...data,
          createdAt: data.createdAt ?? new Date(),
        });
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create friend request: ${error}`);
    }
  }

  async update(
    entity: FriendRequest,
    trx?: Transaction,
  ): Promise<Result<FriendRequest>> {
    try {
      const data = friendRequestToPersistence(entity);
      await this.getDb(trx)
        .update(friendRequestTable)
        .set({
          status: data.status,
          respondedAt: data.respondedAt,
        })
        .where(eq(friendRequestTable.id, String(entity.id.value)));
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update friend request: ${error}`);
    }
  }

  async delete(
    id: FriendRequestId,
    trx?: Transaction,
  ): Promise<Result<FriendRequestId>> {
    try {
      await this.getDb(trx)
        .delete(friendRequestTable)
        .where(eq(friendRequestTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete friend request: ${error}`);
    }
  }

  async findById(id: FriendRequestId): Promise<Result<Option<FriendRequest>>> {
    try {
      const result = await db
        .select()
        .from(friendRequestTable)
        .where(eq(friendRequestTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const friendRequestResult = friendRequestToDomain(record);
      if (friendRequestResult.isFailure) {
        return Result.fail(friendRequestResult.getError());
      }

      return Result.ok(Option.some(friendRequestResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find friend request by id: ${error}`);
    }
  }

  async findByUsers(
    senderId: string,
    receiverId: string,
  ): Promise<Result<Option<FriendRequest>>> {
    try {
      const result = await db
        .select()
        .from(friendRequestTable)
        .where(
          or(
            and(
              eq(friendRequestTable.senderId, senderId),
              eq(friendRequestTable.receiverId, receiverId),
            ),
            and(
              eq(friendRequestTable.senderId, receiverId),
              eq(friendRequestTable.receiverId, senderId),
            ),
          ),
        )
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const friendRequestResult = friendRequestToDomain(record);
      if (friendRequestResult.isFailure) {
        return Result.fail(friendRequestResult.getError());
      }

      return Result.ok(Option.some(friendRequestResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find friend request by users: ${error}`);
    }
  }

  async findPendingForUser(
    userId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<FriendRequest>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(friendRequestTable)
        .where(
          and(
            eq(friendRequestTable.receiverId, userId),
            eq(friendRequestTable.status, FriendRequestStatusEnum.PENDING),
          ),
        )
        .orderBy(desc(friendRequestTable.createdAt))
        .limit(pagination.limit)
        .offset(offset);

      const countResult = await db
        .select()
        .from(friendRequestTable)
        .where(
          and(
            eq(friendRequestTable.receiverId, userId),
            eq(friendRequestTable.status, FriendRequestStatusEnum.PENDING),
          ),
        );

      const friendRequests: FriendRequest[] = [];
      for (const record of records) {
        const friendRequestResult = friendRequestToDomain(record);
        if (friendRequestResult.isFailure) {
          return Result.fail(friendRequestResult.getError());
        }
        friendRequests.push(friendRequestResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(friendRequests, pagination, countResult.length),
      );
    } catch (error) {
      return Result.fail(
        `Failed to find pending friend requests for user: ${error}`,
      );
    }
  }

  async findFriendsForUser(
    userId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<FriendRequest>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(friendRequestTable)
        .where(
          and(
            or(
              eq(friendRequestTable.senderId, userId),
              eq(friendRequestTable.receiverId, userId),
            ),
            eq(friendRequestTable.status, FriendRequestStatusEnum.ACCEPTED),
          ),
        )
        .orderBy(desc(friendRequestTable.createdAt))
        .limit(pagination.limit)
        .offset(offset);

      const countResult = await db
        .select()
        .from(friendRequestTable)
        .where(
          and(
            or(
              eq(friendRequestTable.senderId, userId),
              eq(friendRequestTable.receiverId, userId),
            ),
            eq(friendRequestTable.status, FriendRequestStatusEnum.ACCEPTED),
          ),
        );

      const friendRequests: FriendRequest[] = [];
      for (const record of records) {
        const friendRequestResult = friendRequestToDomain(record);
        if (friendRequestResult.isFailure) {
          return Result.fail(friendRequestResult.getError());
        }
        friendRequests.push(friendRequestResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(friendRequests, pagination, countResult.length),
      );
    } catch (error) {
      return Result.fail(`Failed to find friends for user: ${error}`);
    }
  }

  async existsBetweenUsers(
    senderId: string,
    receiverId: string,
  ): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: friendRequestTable.id })
        .from(friendRequestTable)
        .where(
          or(
            and(
              eq(friendRequestTable.senderId, senderId),
              eq(friendRequestTable.receiverId, receiverId),
            ),
            and(
              eq(friendRequestTable.senderId, receiverId),
              eq(friendRequestTable.receiverId, senderId),
            ),
          ),
        )
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(
        `Failed to check friend request existence between users: ${error}`,
      );
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<FriendRequest>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db
          .select()
          .from(friendRequestTable)
          .orderBy(desc(friendRequestTable.createdAt))
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const friendRequests: FriendRequest[] = [];
      for (const record of records) {
        const friendRequestResult = friendRequestToDomain(record);
        if (friendRequestResult.isFailure) {
          return Result.fail(friendRequestResult.getError());
        }
        friendRequests.push(friendRequestResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(
          friendRequests,
          pagination,
          countResult.getValue(),
        ),
      );
    } catch (error) {
      return Result.fail(`Failed to find all friend requests: ${error}`);
    }
  }

  async findMany(
    props: Partial<FriendRequest["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<FriendRequest>>> {
    try {
      const senderId = props.senderId;
      const receiverId = props.receiverId;

      if (!senderId && !receiverId) {
        return this.findAll(pagination);
      }

      const offset = (pagination.page - 1) * pagination.limit;
      const conditions = [];

      if (senderId) {
        conditions.push(eq(friendRequestTable.senderId, senderId));
      }
      if (receiverId) {
        conditions.push(eq(friendRequestTable.receiverId, receiverId));
      }

      const records = await db
        .select()
        .from(friendRequestTable)
        .where(and(...conditions))
        .orderBy(desc(friendRequestTable.createdAt))
        .limit(pagination.limit)
        .offset(offset);

      const friendRequests: FriendRequest[] = [];
      for (const record of records) {
        const friendRequestResult = friendRequestToDomain(record);
        if (friendRequestResult.isFailure) {
          return Result.fail(friendRequestResult.getError());
        }
        friendRequests.push(friendRequestResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(
          friendRequests,
          pagination,
          friendRequests.length,
        ),
      );
    } catch (error) {
      return Result.fail(`Failed to find friend requests: ${error}`);
    }
  }

  async findBy(
    props: Partial<FriendRequest["_props"]>,
  ): Promise<Result<Option<FriendRequest>>> {
    try {
      const senderId = props.senderId;
      const receiverId = props.receiverId;

      if (senderId && receiverId) {
        return this.findByUsers(senderId, receiverId);
      }

      return Result.ok(Option.none());
    } catch (error) {
      return Result.fail(`Failed to find friend request: ${error}`);
    }
  }

  async exists(id: FriendRequestId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: friendRequestTable.id })
        .from(friendRequestTable)
        .where(eq(friendRequestTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check friend request existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const result = await db.select().from(friendRequestTable);
      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(`Failed to count friend requests: ${error}`);
    }
  }
}
