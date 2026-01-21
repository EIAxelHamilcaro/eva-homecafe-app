import type {
  BaseRepository,
  Option,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { Conversation } from "@/domain/conversation/conversation.aggregate";
import type { ConversationId } from "@/domain/conversation/conversation-id";

export interface IConversationRepository extends BaseRepository<Conversation> {
  findById(id: ConversationId): Promise<Result<Option<Conversation>>>;
  findByParticipants(
    participantIds: string[],
  ): Promise<Result<Option<Conversation>>>;
  findAllForUser(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<Conversation>>>;
}
