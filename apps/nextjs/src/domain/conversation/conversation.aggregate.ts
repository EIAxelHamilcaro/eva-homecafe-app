import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { ConversationId } from "./conversation-id";
import {
  InvalidParticipantCountError,
  ParticipantNotFoundError,
  UserNotInConversationError,
} from "./errors/conversation.errors";
import { ConversationCreatedEvent } from "./events/conversation-created.event";
import { ConversationReadEvent } from "./events/conversation-read.event";
import type { MessagePreview } from "./value-objects/message-preview.vo";
import type { Participant } from "./value-objects/participant.vo";

export interface IConversationProps {
  participants: Participant[];
  createdBy: string;
  lastMessage: Option<MessagePreview>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateConversationProps {
  participants: Participant[];
  createdBy: string;
}

export class Conversation extends Aggregate<IConversationProps> {
  private constructor(props: IConversationProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): ConversationId {
    return ConversationId.create(this._id);
  }

  static create(
    props: ICreateConversationProps,
    id?: UUID<string | number>,
  ): Result<Conversation> {
    if (props.participants.length < 2) {
      return Result.fail(new InvalidParticipantCountError().message);
    }

    const newId = id ?? new UUID<string>();
    const now = new Date();

    const conversation = new Conversation(
      {
        ...props,
        lastMessage: Option.none(),
        createdAt: now,
        updatedAt: now,
      },
      newId,
    );

    if (!id) {
      conversation.addEvent(
        new ConversationCreatedEvent(
          conversation.id.value.toString(),
          props.participants.map((p) => p.userId),
          props.createdBy,
        ),
      );
    }

    return Result.ok(conversation);
  }

  static reconstitute(
    props: IConversationProps,
    id: ConversationId,
  ): Conversation {
    return new Conversation(props, id);
  }

  isParticipant(userId: string): boolean {
    return this._props.participants.some((p) => p.userId === userId);
  }

  validateParticipant(userId: string): Result<void> {
    if (!this.isParticipant(userId)) {
      return Result.fail(new UserNotInConversationError().message);
    }
    return Result.ok();
  }

  getParticipant(userId: string): Option<Participant> {
    const participant = this._props.participants.find(
      (p) => p.userId === userId,
    );
    return Option.fromNullable(participant);
  }

  updateLastMessage(preview: MessagePreview): void {
    this._props.lastMessage = Option.some(preview);
    this.touch();
  }

  markAsRead(userId: string): Result<void> {
    const participant = this._props.participants.find(
      (p) => p.userId === userId,
    );

    if (!participant) {
      return Result.fail(new ParticipantNotFoundError().message);
    }

    const participantIndex = this._props.participants.indexOf(participant);
    const now = new Date();

    const updatedParticipantResult = participant.withLastReadAt(now);
    if (updatedParticipantResult.isFailure) {
      return Result.fail(updatedParticipantResult.getError());
    }

    this._props.participants[participantIndex] =
      updatedParticipantResult.getValue();
    this.touch();

    this.addEvent(
      new ConversationReadEvent(this.id.value.toString(), userId, now),
    );

    return Result.ok();
  }

  getOtherParticipants(userId: string): Participant[] {
    return this._props.participants.filter((p) => p.userId !== userId);
  }

  private touch(): void {
    this._props.updatedAt = new Date();
  }
}
