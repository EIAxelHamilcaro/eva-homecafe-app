import { Result, WatchedList } from "@packages/ddd-kit";
import { TooManyAttachmentsError } from "../errors/message.errors";
import type { MediaAttachment } from "../value-objects/media-attachment.vo";

const MAX_ATTACHMENTS = 10;

export class AttachmentsList extends WatchedList<MediaAttachment> {
  private constructor(initialItems?: MediaAttachment[]) {
    super(initialItems);
  }

  compareItems(a: MediaAttachment, b: MediaAttachment): boolean {
    return a.id === b.id;
  }

  static create(initialItems?: MediaAttachment[]): Result<AttachmentsList> {
    if (initialItems && initialItems.length > MAX_ATTACHMENTS) {
      return Result.fail(new TooManyAttachmentsError(MAX_ATTACHMENTS).message);
    }
    return Result.ok(new AttachmentsList(initialItems));
  }

  add(item: MediaAttachment): Result<void> {
    if (this.count() >= MAX_ATTACHMENTS && !this.exists(item)) {
      return Result.fail(new TooManyAttachmentsError(MAX_ATTACHMENTS).message);
    }
    return super.add(item);
  }
}
