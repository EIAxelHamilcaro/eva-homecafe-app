import { type DomainEvent, match, UUID } from "@packages/ddd-kit";
import type { IConversationRepository } from "@/application/ports/conversation-repository.port";
import { ConversationId } from "@/domain/conversation/conversation-id";
import type { ConversationCreatedEvent } from "@/domain/conversation/events/conversation-created.event";
import type { ConversationReadEvent } from "@/domain/conversation/events/conversation-read.event";
import type { MessageReactionAddedEvent } from "@/domain/message/events/message-reaction-added.event";
import type { MessageReactionRemovedEvent } from "@/domain/message/events/message-reaction-removed.event";
import type { MessageSentEvent } from "@/domain/message/events/message-sent.event";

export interface IChatBroadcast {
  messageSent(
    participantIds: string[],
    data: {
      messageId: string;
      conversationId: string;
      senderId: string;
      content: string | null;
      hasAttachments: boolean;
    },
  ): void;
  reactionAdded(
    participantIds: string[],
    data: {
      messageId: string;
      conversationId: string;
      userId: string;
      emoji: string;
    },
  ): void;
  reactionRemoved(
    participantIds: string[],
    data: {
      messageId: string;
      conversationId: string;
      userId: string;
      emoji: string;
    },
  ): void;
  conversationCreated(
    participantIds: string[],
    data: {
      conversationId: string;
      createdBy: string;
      participantIds: string[];
    },
  ): void;
  conversationRead(
    participantIds: string[],
    data: {
      conversationId: string;
      userId: string;
      readAt: string;
    },
  ): void;
}

const CHAT_EVENT_TYPES = new Set([
  "MessageSent",
  "MessageReactionAdded",
  "MessageReactionRemoved",
  "ConversationCreated",
  "ConversationRead",
]);

export class ChatSSEHandler {
  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly broadcast: IChatBroadcast,
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    if (!CHAT_EVENT_TYPES.has(event.type)) return;

    switch (event.type) {
      case "MessageSent":
        await this.handleMessageSent(event as MessageSentEvent);
        break;
      case "MessageReactionAdded":
        await this.handleReactionAdded(event as MessageReactionAddedEvent);
        break;
      case "MessageReactionRemoved":
        await this.handleReactionRemoved(event as MessageReactionRemovedEvent);
        break;
      case "ConversationCreated":
        this.handleConversationCreated(event as ConversationCreatedEvent);
        break;
      case "ConversationRead":
        await this.handleConversationRead(event as ConversationReadEvent);
        break;
    }
  }

  private async handleMessageSent(event: MessageSentEvent): Promise<void> {
    const participants = await this.getParticipantIds(event.conversationId);
    if (!participants) return;

    this.broadcast.messageSent(participants, {
      messageId: event.aggregateId,
      conversationId: event.conversationId,
      senderId: event.senderId,
      content: event.content || null,
      hasAttachments: event.hasAttachments,
    });
  }

  private async handleReactionAdded(
    event: MessageReactionAddedEvent,
  ): Promise<void> {
    const participants = await this.getParticipantIds(event.conversationId);
    if (!participants) return;

    this.broadcast.reactionAdded(participants, {
      messageId: event.aggregateId,
      conversationId: event.conversationId,
      userId: event.userId,
      emoji: event.emoji,
    });
  }

  private async handleReactionRemoved(
    event: MessageReactionRemovedEvent,
  ): Promise<void> {
    const participants = await this.getParticipantIds(event.conversationId);
    if (!participants) return;

    this.broadcast.reactionRemoved(participants, {
      messageId: event.aggregateId,
      conversationId: event.conversationId,
      userId: event.userId,
      emoji: event.emoji,
    });
  }

  private handleConversationCreated(event: ConversationCreatedEvent): void {
    this.broadcast.conversationCreated(event.participantIds, {
      conversationId: event.aggregateId,
      createdBy: event.createdBy,
      participantIds: event.participantIds,
    });
  }

  private async handleConversationRead(
    event: ConversationReadEvent,
  ): Promise<void> {
    const participants = await this.getParticipantIds(event.aggregateId);
    if (!participants) return;

    this.broadcast.conversationRead(participants, {
      conversationId: event.aggregateId,
      userId: event.userId,
      readAt: event.readAt.toISOString(),
    });
  }

  private async getParticipantIds(
    conversationId: string,
  ): Promise<string[] | null> {
    const convId = ConversationId.create(new UUID(conversationId));
    const result = await this.conversationRepo.findById(convId);
    if (result.isFailure) return null;

    return match(result.getValue(), {
      Some: (conversation) =>
        conversation.get("participants").map((p) => p.userId),
      None: () => null,
    });
  }
}
