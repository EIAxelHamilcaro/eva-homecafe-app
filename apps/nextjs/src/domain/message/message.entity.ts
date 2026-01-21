import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import {
  DuplicateReactionError,
  EmptyMessageError,
  ReactionNotFoundError,
} from "./errors/message.errors";
import { MessageReactionAddedEvent } from "./events/message-reaction-added.event";
import { MessageReactionRemovedEvent } from "./events/message-reaction-removed.event";
import { MessageSentEvent } from "./events/message-sent.event";
import { MessageId } from "./message-id";
import type { MediaAttachment } from "./value-objects/media-attachment.vo";
import type { MessageContent } from "./value-objects/message-content.vo";
import { Reaction } from "./value-objects/reaction.vo";
import type { ReactionEmoji } from "./value-objects/reaction-type.vo";
import { AttachmentsList } from "./watched-lists/attachments.list";
import { ReactionsList } from "./watched-lists/reactions.list";

export interface IMessageProps {
  conversationId: string;
  senderId: string;
  content: Option<MessageContent>;
  attachments: AttachmentsList;
  reactions: ReactionsList;
  createdAt: Date;
  updatedAt: Date;
  editedAt: Option<Date>;
  deletedAt: Option<Date>;
}

export interface ICreateMessageProps {
  conversationId: string;
  senderId: string;
  content: Option<MessageContent>;
  attachments?: MediaAttachment[];
}

export class Message extends Aggregate<IMessageProps> {
  private constructor(props: IMessageProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): MessageId {
    return MessageId.create(this._id);
  }

  static create(
    props: ICreateMessageProps,
    id?: UUID<string | number>,
  ): Result<Message> {
    const attachmentsResult = AttachmentsList.create(props.attachments ?? []);
    if (attachmentsResult.isFailure) {
      return Result.fail(attachmentsResult.getError());
    }
    const attachmentsList = attachmentsResult.getValue();

    if (props.content.isNone() && attachmentsList.count() === 0) {
      return Result.fail(new EmptyMessageError().message);
    }

    const newId = id ?? new UUID<string>();
    const now = new Date();

    const message = new Message(
      {
        conversationId: props.conversationId,
        senderId: props.senderId,
        content: props.content,
        attachments: attachmentsList,
        reactions: ReactionsList.create([]),
        createdAt: now,
        updatedAt: now,
        editedAt: Option.none(),
        deletedAt: Option.none(),
      },
      newId,
    );

    if (!id) {
      message.addEvent(
        new MessageSentEvent(
          message.id.value.toString(),
          props.conversationId,
          props.senderId,
          props.content.map((c) => c.value).unwrapOr(""),
          attachmentsList.count() > 0,
        ),
      );
    }

    return Result.ok(message);
  }

  static reconstitute(props: IMessageProps, id: MessageId): Message {
    return new Message(props, id);
  }

  addReaction(userId: string, emoji: ReactionEmoji): Result<void> {
    if (this._props.reactions.hasUserReactedWith(userId, emoji)) {
      return Result.fail(new DuplicateReactionError().message);
    }

    const reactionResult = Reaction.createNew(userId, emoji);
    if (reactionResult.isFailure) {
      return Result.fail(reactionResult.getError());
    }

    this._props.reactions.add(reactionResult.getValue());
    this.touch();

    this.addEvent(
      new MessageReactionAddedEvent(
        this.id.value.toString(),
        this._props.conversationId,
        userId,
        emoji,
      ),
    );

    return Result.ok();
  }

  removeReaction(userId: string, emoji: ReactionEmoji): Result<void> {
    const reaction = this._props.reactions.findByUserAndEmoji(userId, emoji);

    if (reaction.isNone()) {
      return Result.fail(new ReactionNotFoundError().message);
    }

    this._props.reactions.remove(reaction.unwrap());
    this.touch();

    this.addEvent(
      new MessageReactionRemovedEvent(
        this.id.value.toString(),
        this._props.conversationId,
        userId,
        emoji,
      ),
    );

    return Result.ok();
  }

  updateContent(content: MessageContent): void {
    this._props.content = Option.some(content);
    this._props.editedAt = Option.some(new Date());
    this.touch();
  }

  softDelete(): void {
    this._props.deletedAt = Option.some(new Date());
    this.touch();
  }

  private touch(): void {
    this._props.updatedAt = new Date();
  }
}
