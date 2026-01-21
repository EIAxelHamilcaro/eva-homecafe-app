import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const messagePreviewSchema = z.object({
  messageId: z.string().min(1, "Message ID is required"),
  content: z
    .string()
    .max(100, "Preview content must be less than 100 characters"),
  senderId: z.string().min(1, "Sender ID is required"),
  sentAt: z.date(),
  hasAttachments: z.boolean(),
});

export interface IMessagePreviewProps {
  messageId: string;
  content: string;
  senderId: string;
  sentAt: Date;
  hasAttachments: boolean;
}

export class MessagePreview extends ValueObject<IMessagePreviewProps> {
  get messageId(): string {
    return this._value.messageId;
  }

  get content(): string {
    return this._value.content;
  }

  get senderId(): string {
    return this._value.senderId;
  }

  get sentAt(): Date {
    return this._value.sentAt;
  }

  get hasAttachments(): boolean {
    return this._value.hasAttachments;
  }

  protected validate(
    value: IMessagePreviewProps,
  ): Result<IMessagePreviewProps> {
    const result = messagePreviewSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid message preview");
    }

    return Result.ok(result.data);
  }

  static fromMessage(
    messageId: string,
    content: string,
    senderId: string,
    sentAt: Date,
    hasAttachments: boolean,
  ): Result<MessagePreview> {
    const truncatedContent =
      content.length > 100 ? `${content.slice(0, 97)}...` : content;

    return MessagePreview.create({
      messageId,
      content: truncatedContent,
      senderId,
      sentAt,
      hasAttachments,
    });
  }
}
