import { WatchedList } from "@packages/ddd-kit";
import type { MediaAttachment } from "../value-objects/media-attachment.vo";

export class AttachmentsList extends WatchedList<MediaAttachment> {
  private constructor(initialItems?: MediaAttachment[]) {
    super(initialItems);
  }

  compareItems(a: MediaAttachment, b: MediaAttachment): boolean {
    return a.id === b.id;
  }

  static create(initialItems?: MediaAttachment[]): AttachmentsList {
    return new AttachmentsList(initialItems);
  }
}
