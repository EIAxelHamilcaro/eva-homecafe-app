import type {
  BaseRepository,
  Option,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { Message } from "@/domain/message/message.entity";
import type { MessageId } from "@/domain/message/message-id";

export interface IMessageRepository extends BaseRepository<Message> {
  findById(id: MessageId): Promise<Result<Option<Message>>>;
  findByConversation(
    conversationId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<Message>>>;
}
