import { Option, Result, UUID } from "@packages/ddd-kit";
import type {
  messageAttachment as attachmentTable,
  message as messageTable,
  messageReaction as reactionTable,
} from "@packages/drizzle/schema";
import { type IMessageProps, Message } from "@/domain/message/message.entity";
import { MessageId } from "@/domain/message/message-id";
import {
  type AllowedMimeType,
  type IMediaAttachmentProps,
  MediaAttachment,
} from "@/domain/message/value-objects/media-attachment.vo";
import { MessageContent } from "@/domain/message/value-objects/message-content.vo";
import {
  type IReactionProps,
  Reaction,
} from "@/domain/message/value-objects/reaction.vo";
import type { ReactionEmoji } from "@/domain/message/value-objects/reaction-type.vo";
import { AttachmentsList } from "@/domain/message/watched-lists/attachments.list";
import { ReactionsList } from "@/domain/message/watched-lists/reactions.list";

type MessageRecord = typeof messageTable.$inferSelect;
type AttachmentRecord = typeof attachmentTable.$inferSelect;
type ReactionRecord = typeof reactionTable.$inferSelect;

export interface MessageWithRelations {
  message: MessageRecord;
  attachments: AttachmentRecord[];
  reactions: ReactionRecord[];
}

interface MessagePersistence {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
}

interface AttachmentPersistence {
  id: string;
  messageId: string;
  url: string;
  mimeType: string;
  size: number;
  filename: string;
  width: number | null;
  height: number | null;
  createdAt: Date;
}

interface ReactionPersistence {
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export function messageToDomain(data: MessageWithRelations): Result<Message> {
  const attachments: MediaAttachment[] = [];
  for (const att of data.attachments) {
    const props: IMediaAttachmentProps = {
      id: att.id,
      url: att.url,
      mimeType: att.mimeType as AllowedMimeType,
      size: att.size,
      filename: att.filename,
      dimensions:
        att.width !== null && att.height !== null
          ? { width: att.width, height: att.height }
          : undefined,
    };
    const attachmentResult = MediaAttachment.create(props);
    if (attachmentResult.isFailure) {
      return Result.fail(attachmentResult.getError());
    }
    attachments.push(attachmentResult.getValue());
  }

  const attachmentsListResult = AttachmentsList.create(attachments);
  if (attachmentsListResult.isFailure) {
    return Result.fail(attachmentsListResult.getError());
  }

  const reactions: Reaction[] = [];
  for (const r of data.reactions) {
    const props: IReactionProps = {
      userId: r.userId,
      emoji: r.emoji as ReactionEmoji,
      createdAt: r.createdAt,
    };
    const reactionResult = Reaction.create(props);
    if (reactionResult.isFailure) {
      return Result.fail(reactionResult.getError());
    }
    reactions.push(reactionResult.getValue());
  }

  let contentOption: Option<MessageContent> = Option.none();
  if (data.message.content !== null) {
    const contentResult = MessageContent.create(data.message.content);
    if (contentResult.isFailure) {
      return Result.fail(contentResult.getError());
    }
    contentOption = Option.some(contentResult.getValue());
  }

  const messageId = MessageId.create(new UUID(data.message.id));

  const props: IMessageProps = {
    conversationId: data.message.conversationId,
    senderId: data.message.senderId,
    content: contentOption,
    attachments: attachmentsListResult.getValue(),
    reactions: ReactionsList.create(reactions),
    createdAt: data.message.createdAt,
    updatedAt: data.message.createdAt,
    editedAt: Option.fromNullable(data.message.editedAt),
    deletedAt: Option.fromNullable(data.message.deletedAt),
  };

  return Result.ok(Message.reconstitute(props, messageId));
}

export function messageToPersistence(message: Message): MessagePersistence {
  return {
    id: String(message.id.value),
    conversationId: message.get("conversationId"),
    senderId: message.get("senderId"),
    content: message
      .get("content")
      .map((c) => c.value)
      .toNull(),
    createdAt: message.get("createdAt"),
    editedAt: message.get("editedAt").toNull(),
    deletedAt: message.get("deletedAt").toNull(),
  };
}

export function attachmentsToPersistence(
  message: Message,
): AttachmentPersistence[] {
  const messageId = String(message.id.value);
  const attachmentsList = message.get("attachments");

  return attachmentsList.getItems().map((att) => ({
    id: att.id,
    messageId,
    url: att.url,
    mimeType: att.mimeType,
    size: att.size,
    filename: att.filename,
    width: att.dimensions.map((d) => d.width).toNull(),
    height: att.dimensions.map((d) => d.height).toNull(),
    createdAt: new Date(),
  }));
}

export function reactionsToPersistence(
  message: Message,
): ReactionPersistence[] {
  const messageId = String(message.id.value);
  const reactionsList = message.get("reactions");

  return reactionsList.getItems().map((r) => ({
    messageId,
    userId: r.userId,
    emoji: r.emoji,
    createdAt: r.createdAt,
  }));
}
