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
  count as sqlCount,
  type Transaction,
} from "@packages/drizzle";
import {
  postReaction as postReactionTable,
  post as postTable,
} from "@packages/drizzle/schema";
import {
  postToDomain,
  postToPersistence,
} from "@/adapters/mappers/post.mapper";
import type { IPostRepository } from "@/application/ports/post-repository.port";
import type { Post } from "@/domain/post/post.aggregate";
import type { PostId } from "@/domain/post/post-id";

export class DrizzlePostRepository implements IPostRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(entity: Post, trx?: Transaction): Promise<Result<Post>> {
    try {
      const data = postToPersistence(entity);
      await this.getDb(trx)
        .insert(postTable)
        .values({
          ...data,
          createdAt: data.createdAt ?? new Date(),
        });
      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create post: ${error}`);
    }
  }

  async update(entity: Post, trx?: Transaction): Promise<Result<Post>> {
    try {
      const data = postToPersistence(entity);
      const postId = String(entity.id.value);
      const reactions = entity.get("reactions");
      const newReactions = reactions.getNewItems();
      const removedReactions = reactions.getRemovedItems();

      const hasReactionChanges =
        newReactions.length > 0 || removedReactions.length > 0;

      const performUpdate = async (database: DbClient | Transaction) => {
        await database
          .update(postTable)
          .set({
            content: data.content,
            isPrivate: data.isPrivate,
            images: data.images,
            updatedAt: data.updatedAt ?? new Date(),
          })
          .where(eq(postTable.id, postId));

        for (const reaction of newReactions) {
          await database.insert(postReactionTable).values({
            postId,
            userId: reaction.userId,
            emoji: reaction.emoji,
            createdAt: reaction.createdAt,
          });
        }

        for (const reaction of removedReactions) {
          await database
            .delete(postReactionTable)
            .where(
              and(
                eq(postReactionTable.postId, postId),
                eq(postReactionTable.userId, reaction.userId),
                eq(postReactionTable.emoji, reaction.emoji),
              ),
            );
        }
      };

      if (trx) {
        await performUpdate(trx);
      } else if (hasReactionChanges) {
        await db.transaction(async (tx) => {
          await performUpdate(tx);
        });
      } else {
        await performUpdate(db);
      }

      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update post: ${error}`);
    }
  }

  async delete(id: PostId, trx?: Transaction): Promise<Result<PostId>> {
    try {
      await this.getDb(trx)
        .delete(postTable)
        .where(eq(postTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete post: ${error}`);
    }
  }

  async findById(id: PostId): Promise<Result<Option<Post>>> {
    try {
      const result = await db
        .select()
        .from(postTable)
        .where(eq(postTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const postResult = postToDomain(record);
      if (postResult.isFailure) {
        return Result.fail(postResult.getError());
      }

      return Result.ok(Option.some(postResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find post by id: ${error}`);
    }
  }

  async findByIdWithReactions(id: PostId): Promise<Result<Option<Post>>> {
    try {
      const postId = String(id.value);

      const [postRecords, reactionRecords] = await Promise.all([
        db.select().from(postTable).where(eq(postTable.id, postId)).limit(1),
        db
          .select()
          .from(postReactionTable)
          .where(eq(postReactionTable.postId, postId)),
      ]);

      const record = postRecords[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const postResult = postToDomain(record, reactionRecords);
      if (postResult.isFailure) {
        return Result.fail(postResult.getError());
      }

      return Result.ok(Option.some(postResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find post with reactions: ${error}`);
    }
  }

  async findByUserId(
    userId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Post>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(postTable)
        .where(eq(postTable.userId, userId))
        .orderBy(desc(postTable.createdAt))
        .limit(pagination.limit)
        .offset(offset);

      const [countRow] = await db
        .select({ value: sqlCount() })
        .from(postTable)
        .where(eq(postTable.userId, userId));

      const posts: Post[] = [];
      for (const record of records) {
        const postResult = postToDomain(record);
        if (postResult.isFailure) {
          return Result.fail(postResult.getError());
        }
        posts.push(postResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(posts, pagination, countRow?.value ?? 0),
      );
    } catch (error) {
      return Result.fail(`Failed to find posts for user: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Post>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db
          .select()
          .from(postTable)
          .orderBy(desc(postTable.createdAt))
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const posts: Post[] = [];
      for (const record of records) {
        const postResult = postToDomain(record);
        if (postResult.isFailure) {
          return Result.fail(postResult.getError());
        }
        posts.push(postResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(posts, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(`Failed to find all posts: ${error}`);
    }
  }

  async findMany(
    props: Partial<Post["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Post>>> {
    try {
      const userId = props.userId;

      if (!userId) {
        return this.findAll(pagination);
      }

      return this.findByUserId(userId, pagination);
    } catch (error) {
      return Result.fail(`Failed to find posts: ${error}`);
    }
  }

  async findBy(props: Partial<Post["_props"]>): Promise<Result<Option<Post>>> {
    try {
      const userId = props.userId;

      if (!userId) {
        return Result.ok(Option.none());
      }

      const result = await db
        .select()
        .from(postTable)
        .where(eq(postTable.userId, userId))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const postResult = postToDomain(record);
      if (postResult.isFailure) {
        return Result.fail(postResult.getError());
      }

      return Result.ok(Option.some(postResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find post: ${error}`);
    }
  }

  async exists(id: PostId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: postTable.id })
        .from(postTable)
        .where(eq(postTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check post existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const [result] = await db.select({ value: sqlCount() }).from(postTable);
      return Result.ok(result?.value ?? 0);
    } catch (error) {
      return Result.fail(`Failed to count posts: ${error}`);
    }
  }
}
