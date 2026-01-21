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
  inArray,
  isNull,
  type Transaction,
} from "@packages/drizzle";
import {
  messageAttachment as attachmentTable,
  message as messageTable,
  messageReaction as reactionTable,
} from "@packages/drizzle/schema";
import {
  attachmentsToPersistence,
  type MessageWithRelations,
  messageToDomain,
  messageToPersistence,
  reactionsToPersistence,
} from "@/adapters/mappers/message.mapper";
import type { IMessageRepository } from "@/application/ports/message-repository.port";
import type { Message } from "@/domain/message/message.entity";
import type { MessageId } from "@/domain/message/message-id";

export class DrizzleMessageRepository implements IMessageRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(entity: Message, trx?: Transaction): Promise<Result<Message>> {
    try {
      const dbInstance = this.getDb(trx);
      const messageData = messageToPersistence(entity);
      const attachmentsData = attachmentsToPersistence(entity);
      const reactionsData = reactionsToPersistence(entity);

      await dbInstance.insert(messageTable).values(messageData);

      if (attachmentsData.length > 0) {
        await dbInstance.insert(attachmentTable).values(attachmentsData);
      }

      if (reactionsData.length > 0) {
        await dbInstance.insert(reactionTable).values(reactionsData);
      }

      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create message: ${error}`);
    }
  }

  async update(entity: Message, trx?: Transaction): Promise<Result<Message>> {
    try {
      const dbInstance = this.getDb(trx);
      const messageId = String(entity.id.value);
      const messageData = messageToPersistence(entity);

      await dbInstance
        .update(messageTable)
        .set({
          content: messageData.content,
          editedAt: messageData.editedAt,
          deletedAt: messageData.deletedAt,
        })
        .where(eq(messageTable.id, messageId));

      const reactions = entity.get("reactions");
      const newReactions = reactions.getNewItems();
      const removedReactions = reactions.getRemovedItems();

      for (const removed of removedReactions) {
        await dbInstance
          .delete(reactionTable)
          .where(
            and(
              eq(reactionTable.messageId, messageId),
              eq(reactionTable.userId, removed.userId),
              eq(reactionTable.emoji, removed.emoji),
            ),
          );
      }

      if (newReactions.length > 0) {
        const newReactionsData = newReactions.map((r) => ({
          messageId,
          userId: r.userId,
          emoji: r.emoji,
          createdAt: r.createdAt,
        }));
        await dbInstance.insert(reactionTable).values(newReactionsData);
      }

      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update message: ${error}`);
    }
  }

  async delete(id: MessageId, trx?: Transaction): Promise<Result<MessageId>> {
    try {
      await this.getDb(trx)
        .delete(messageTable)
        .where(eq(messageTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete message: ${error}`);
    }
  }

  async findById(id: MessageId): Promise<Result<Option<Message>>> {
    try {
      const messageId = String(id.value);

      const messageResult = await db
        .select()
        .from(messageTable)
        .where(eq(messageTable.id, messageId))
        .limit(1);

      const messageRecord = messageResult[0];
      if (!messageRecord) {
        return Result.ok(Option.none());
      }

      const attachmentsResult = await db
        .select()
        .from(attachmentTable)
        .where(eq(attachmentTable.messageId, messageId));

      const reactionsResult = await db
        .select()
        .from(reactionTable)
        .where(eq(reactionTable.messageId, messageId));

      const data: MessageWithRelations = {
        message: messageRecord,
        attachments: attachmentsResult,
        reactions: reactionsResult,
      };

      const domainResult = messageToDomain(data);
      if (domainResult.isFailure) {
        return Result.fail(domainResult.getError());
      }

      return Result.ok(Option.some(domainResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find message by id: ${error}`);
    }
  }

  async findByConversation(
    conversationId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Message>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [messageRecords, countResult] = await Promise.all([
        db
          .select()
          .from(messageTable)
          .where(
            and(
              eq(messageTable.conversationId, conversationId),
              isNull(messageTable.deletedAt),
            ),
          )
          .orderBy(desc(messageTable.createdAt))
          .limit(pagination.limit)
          .offset(offset),
        db
          .select()
          .from(messageTable)
          .where(
            and(
              eq(messageTable.conversationId, conversationId),
              isNull(messageTable.deletedAt),
            ),
          ),
      ]);

      const totalCount = countResult.length;

      if (messageRecords.length === 0) {
        return Result.ok(createPaginatedResult([], pagination, 0));
      }

      const messageIds = messageRecords.map((m) => m.id);

      const [attachmentsResult, reactionsResult] = await Promise.all([
        db
          .select()
          .from(attachmentTable)
          .where(inArray(attachmentTable.messageId, messageIds)),
        db
          .select()
          .from(reactionTable)
          .where(inArray(reactionTable.messageId, messageIds)),
      ]);

      const attachmentsByMessage = new Map<
        string,
        (typeof attachmentsResult)[number][]
      >();
      for (const att of attachmentsResult) {
        const existing = attachmentsByMessage.get(att.messageId) ?? [];
        existing.push(att);
        attachmentsByMessage.set(att.messageId, existing);
      }

      const reactionsByMessage = new Map<
        string,
        (typeof reactionsResult)[number][]
      >();
      for (const r of reactionsResult) {
        const existing = reactionsByMessage.get(r.messageId) ?? [];
        existing.push(r);
        reactionsByMessage.set(r.messageId, existing);
      }

      const messages: Message[] = [];
      for (const messageRecord of messageRecords) {
        const data: MessageWithRelations = {
          message: messageRecord,
          attachments: attachmentsByMessage.get(messageRecord.id) ?? [],
          reactions: reactionsByMessage.get(messageRecord.id) ?? [],
        };

        const domainResult = messageToDomain(data);
        if (domainResult.isFailure) {
          return Result.fail(domainResult.getError());
        }

        messages.push(domainResult.getValue());
      }

      return Result.ok(createPaginatedResult(messages, pagination, totalCount));
    } catch (error) {
      return Result.fail(`Failed to find messages for conversation: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Message>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [messageRecords, countResult] = await Promise.all([
        db
          .select()
          .from(messageTable)
          .where(isNull(messageTable.deletedAt))
          .orderBy(desc(messageTable.createdAt))
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      if (messageRecords.length === 0) {
        return Result.ok(
          createPaginatedResult([], pagination, countResult.getValue()),
        );
      }

      const messageIds = messageRecords.map((m) => m.id);

      const [attachmentsResult, reactionsResult] = await Promise.all([
        db
          .select()
          .from(attachmentTable)
          .where(inArray(attachmentTable.messageId, messageIds)),
        db
          .select()
          .from(reactionTable)
          .where(inArray(reactionTable.messageId, messageIds)),
      ]);

      const attachmentsByMessage = new Map<
        string,
        (typeof attachmentsResult)[number][]
      >();
      for (const att of attachmentsResult) {
        const existing = attachmentsByMessage.get(att.messageId) ?? [];
        existing.push(att);
        attachmentsByMessage.set(att.messageId, existing);
      }

      const reactionsByMessage = new Map<
        string,
        (typeof reactionsResult)[number][]
      >();
      for (const r of reactionsResult) {
        const existing = reactionsByMessage.get(r.messageId) ?? [];
        existing.push(r);
        reactionsByMessage.set(r.messageId, existing);
      }

      const messages: Message[] = [];
      for (const messageRecord of messageRecords) {
        const data: MessageWithRelations = {
          message: messageRecord,
          attachments: attachmentsByMessage.get(messageRecord.id) ?? [],
          reactions: reactionsByMessage.get(messageRecord.id) ?? [],
        };

        const domainResult = messageToDomain(data);
        if (domainResult.isFailure) {
          return Result.fail(domainResult.getError());
        }

        messages.push(domainResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(messages, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(`Failed to find all messages: ${error}`);
    }
  }

  async findMany(
    _props: Partial<Message["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Message>>> {
    return this.findAll(pagination);
  }

  async findBy(
    _props: Partial<Message["_props"]>,
  ): Promise<Result<Option<Message>>> {
    return Result.ok(Option.none());
  }

  async exists(id: MessageId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: messageTable.id })
        .from(messageTable)
        .where(eq(messageTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check message existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const result = await db
        .select()
        .from(messageTable)
        .where(isNull(messageTable.deletedAt));
      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(`Failed to count messages: ${error}`);
    }
  }
}
