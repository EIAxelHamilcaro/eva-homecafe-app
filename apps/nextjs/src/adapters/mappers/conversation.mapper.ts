import { Option, Result, UUID } from "@packages/ddd-kit";
import type {
  conversation as conversationTable,
  message as messageTable,
  conversationParticipant as participantTable,
} from "@packages/drizzle/schema";
import { Conversation } from "@/domain/conversation/conversation.aggregate";
import { ConversationId } from "@/domain/conversation/conversation-id";
import { MessagePreview } from "@/domain/conversation/value-objects/message-preview.vo";
import { Participant } from "@/domain/conversation/value-objects/participant.vo";

type ConversationRecord = typeof conversationTable.$inferSelect;
type ParticipantRecord = typeof participantTable.$inferSelect;
type MessageRecord = typeof messageTable.$inferSelect;

export interface ConversationWithRelations {
  conversation: ConversationRecord;
  participants: ParticipantRecord[];
  lastMessage: MessageRecord | null;
}

export function conversationToDomain(
  data: ConversationWithRelations,
): Result<Conversation> {
  const participantResults = data.participants.map((p) =>
    Participant.create({
      userId: p.userId,
      joinedAt: p.joinedAt,
      lastReadAt: Option.fromNullable(p.lastReadAt),
    }),
  );

  const combinedParticipants = Result.combine(participantResults);
  if (combinedParticipants.isFailure) {
    return Result.fail(combinedParticipants.getError());
  }

  const participants = participantResults.map((r) => r.getValue());

  let lastMessage: Option<MessagePreview> = Option.none();
  if (data.lastMessage) {
    const lastMessageResult = MessagePreview.fromMessage(
      data.lastMessage.id,
      data.lastMessage.content ?? "",
      data.lastMessage.senderId,
      data.lastMessage.createdAt,
      false,
    );
    if (lastMessageResult.isFailure) {
      return Result.fail(lastMessageResult.getError());
    }
    lastMessage = Option.some(lastMessageResult.getValue());
  }

  return Result.ok(
    Conversation.reconstitute(
      {
        participants,
        createdBy: data.conversation.createdBy,
        lastMessage,
        createdAt: data.conversation.createdAt,
        updatedAt: data.conversation.updatedAt,
      },
      ConversationId.create(new UUID(data.conversation.id)),
    ),
  );
}

export interface ConversationPersistence {
  id: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParticipantPersistence {
  conversationId: string;
  userId: string;
  joinedAt: Date;
  lastReadAt: Date | null;
}

export function conversationToPersistence(
  conversation: Conversation,
): ConversationPersistence {
  return {
    id: String(conversation.id.value),
    createdBy: conversation.get("createdBy"),
    createdAt: conversation.get("createdAt"),
    updatedAt: conversation.get("updatedAt"),
  };
}

export function participantsToPersistence(
  conversation: Conversation,
): ParticipantPersistence[] {
  const conversationId = String(conversation.id.value);
  return conversation.get("participants").map((p) => ({
    conversationId,
    userId: p.userId,
    joinedAt: p.joinedAt,
    lastReadAt: p.lastReadAt.toNull(),
  }));
}
