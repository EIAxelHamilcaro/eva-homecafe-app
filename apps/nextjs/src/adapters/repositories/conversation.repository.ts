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
  type Transaction,
} from "@packages/drizzle";
import {
  conversation as conversationTable,
  message as messageTable,
  conversationParticipant as participantTable,
} from "@packages/drizzle/schema";
import {
  type ConversationWithRelations,
  conversationToDomain,
  conversationToPersistence,
  participantsToPersistence,
} from "@/adapters/mappers/conversation.mapper";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import type { Conversation } from "@/domain/conversation/conversation.aggregate";
import type { ConversationId } from "@/domain/conversation/conversation-id";

export class DrizzleConversationRepository implements IConversationRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(
    entity: Conversation,
    trx?: Transaction,
  ): Promise<Result<Conversation>> {
    try {
      const dbInstance = this.getDb(trx);
      const data = conversationToPersistence(entity);
      const participants = participantsToPersistence(entity);

      await dbInstance.insert(conversationTable).values(data);

      if (participants.length > 0) {
        await dbInstance.insert(participantTable).values(participants);
      }

      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to create conversation: ${error}`);
    }
  }

  async update(
    entity: Conversation,
    trx?: Transaction,
  ): Promise<Result<Conversation>> {
    try {
      const dbInstance = this.getDb(trx);
      const conversationId = String(entity.id.value);

      await dbInstance
        .update(conversationTable)
        .set({ updatedAt: entity.get("updatedAt") })
        .where(eq(conversationTable.id, conversationId));

      const participants = participantsToPersistence(entity);
      for (const participant of participants) {
        await dbInstance
          .update(participantTable)
          .set({ lastReadAt: participant.lastReadAt })
          .where(
            and(
              eq(participantTable.conversationId, conversationId),
              eq(participantTable.userId, participant.userId),
            ),
          );
      }

      return Result.ok(entity);
    } catch (error) {
      return Result.fail(`Failed to update conversation: ${error}`);
    }
  }

  async delete(
    id: ConversationId,
    trx?: Transaction,
  ): Promise<Result<ConversationId>> {
    try {
      await this.getDb(trx)
        .delete(conversationTable)
        .where(eq(conversationTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete conversation: ${error}`);
    }
  }

  async findById(id: ConversationId): Promise<Result<Option<Conversation>>> {
    try {
      const conversationId = String(id.value);

      const conversationResult = await db
        .select()
        .from(conversationTable)
        .where(eq(conversationTable.id, conversationId))
        .limit(1);

      const conversationRecord = conversationResult[0];
      if (!conversationRecord) {
        return Result.ok(Option.none());
      }

      const participantsResult = await db
        .select()
        .from(participantTable)
        .where(eq(participantTable.conversationId, conversationId));

      const lastMessageResult = await db
        .select()
        .from(messageTable)
        .where(eq(messageTable.conversationId, conversationId))
        .orderBy(desc(messageTable.createdAt))
        .limit(1);

      const data: ConversationWithRelations = {
        conversation: conversationRecord,
        participants: participantsResult,
        lastMessage: lastMessageResult[0] ?? null,
      };

      const domainResult = conversationToDomain(data);
      if (domainResult.isFailure) {
        return Result.fail(domainResult.getError());
      }

      return Result.ok(Option.some(domainResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find conversation by id: ${error}`);
    }
  }

  async findByParticipants(
    participantIds: string[],
  ): Promise<Result<Option<Conversation>>> {
    try {
      if (participantIds.length < 2) {
        return Result.ok(Option.none());
      }

      const sortedIds = [...participantIds].sort();

      const conversationsWithParticipants = await db
        .select({ conversationId: participantTable.conversationId })
        .from(participantTable)
        .where(inArray(participantTable.userId, sortedIds));

      const conversationCounts = new Map<string, Set<string>>();
      for (const row of conversationsWithParticipants) {
        if (!conversationCounts.has(row.conversationId)) {
          conversationCounts.set(row.conversationId, new Set());
        }
      }

      const allParticipants = await db
        .select()
        .from(participantTable)
        .where(
          inArray(
            participantTable.conversationId,
            Array.from(conversationCounts.keys()),
          ),
        );

      for (const p of allParticipants) {
        const set = conversationCounts.get(p.conversationId);
        if (set) {
          set.add(p.userId);
        }
      }

      let matchingConversationId: string | null = null;
      for (const [convId, userIds] of conversationCounts) {
        const convUserIds = [...userIds].sort();
        if (
          convUserIds.length === sortedIds.length &&
          convUserIds.every((id, i) => id === sortedIds[i])
        ) {
          matchingConversationId = convId;
          break;
        }
      }

      if (!matchingConversationId) {
        return Result.ok(Option.none());
      }

      const conversationResult = await db
        .select()
        .from(conversationTable)
        .where(eq(conversationTable.id, matchingConversationId))
        .limit(1);

      const conversationRecord = conversationResult[0];
      if (!conversationRecord) {
        return Result.ok(Option.none());
      }

      const participantsResult = await db
        .select()
        .from(participantTable)
        .where(eq(participantTable.conversationId, matchingConversationId));

      const lastMessageResult = await db
        .select()
        .from(messageTable)
        .where(eq(messageTable.conversationId, matchingConversationId))
        .orderBy(desc(messageTable.createdAt))
        .limit(1);

      const data: ConversationWithRelations = {
        conversation: conversationRecord,
        participants: participantsResult,
        lastMessage: lastMessageResult[0] ?? null,
      };

      const domainResult = conversationToDomain(data);
      if (domainResult.isFailure) {
        return Result.fail(domainResult.getError());
      }

      return Result.ok(Option.some(domainResult.getValue()));
    } catch (error) {
      return Result.fail(
        `Failed to find conversation by participants: ${error}`,
      );
    }
  }

  async findAllForUser(
    userId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Conversation>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const userConversationIds = await db
        .select({ conversationId: participantTable.conversationId })
        .from(participantTable)
        .where(eq(participantTable.userId, userId));

      const conversationIds = userConversationIds.map((r) => r.conversationId);

      if (conversationIds.length === 0) {
        return Result.ok(createPaginatedResult([], pagination, 0));
      }

      const totalCount = conversationIds.length;

      const conversationRecords = await db
        .select()
        .from(conversationTable)
        .where(inArray(conversationTable.id, conversationIds))
        .orderBy(desc(conversationTable.updatedAt))
        .limit(pagination.limit)
        .offset(offset);

      const conversations: Conversation[] = [];

      for (const conversationRecord of conversationRecords) {
        const participantsResult = await db
          .select()
          .from(participantTable)
          .where(eq(participantTable.conversationId, conversationRecord.id));

        const lastMessageResult = await db
          .select()
          .from(messageTable)
          .where(eq(messageTable.conversationId, conversationRecord.id))
          .orderBy(desc(messageTable.createdAt))
          .limit(1);

        const data: ConversationWithRelations = {
          conversation: conversationRecord,
          participants: participantsResult,
          lastMessage: lastMessageResult[0] ?? null,
        };

        const domainResult = conversationToDomain(data);
        if (domainResult.isFailure) {
          return Result.fail(domainResult.getError());
        }

        conversations.push(domainResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(conversations, pagination, totalCount),
      );
    } catch (error) {
      return Result.fail(`Failed to find conversations for user: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Conversation>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db
          .select()
          .from(conversationTable)
          .orderBy(desc(conversationTable.updatedAt))
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const conversations: Conversation[] = [];

      for (const conversationRecord of records) {
        const participantsResult = await db
          .select()
          .from(participantTable)
          .where(eq(participantTable.conversationId, conversationRecord.id));

        const lastMessageResult = await db
          .select()
          .from(messageTable)
          .where(eq(messageTable.conversationId, conversationRecord.id))
          .orderBy(desc(messageTable.createdAt))
          .limit(1);

        const data: ConversationWithRelations = {
          conversation: conversationRecord,
          participants: participantsResult,
          lastMessage: lastMessageResult[0] ?? null,
        };

        const domainResult = conversationToDomain(data);
        if (domainResult.isFailure) {
          return Result.fail(domainResult.getError());
        }

        conversations.push(domainResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(
          conversations,
          pagination,
          countResult.getValue(),
        ),
      );
    } catch (error) {
      return Result.fail(`Failed to find all conversations: ${error}`);
    }
  }

  async findMany(
    _props: Partial<Conversation["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Conversation>>> {
    return this.findAll(pagination);
  }

  async findBy(
    _props: Partial<Conversation["_props"]>,
  ): Promise<Result<Option<Conversation>>> {
    return Result.ok(Option.none());
  }

  async exists(id: ConversationId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: conversationTable.id })
        .from(conversationTable)
        .where(eq(conversationTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check conversation existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const result = await db.select().from(conversationTable);
      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(`Failed to count conversations: ${error}`);
    }
  }
}
