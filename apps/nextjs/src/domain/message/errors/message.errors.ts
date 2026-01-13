import { DomainError } from "@/domain/errors/domain-error";

export class MessageNotFoundError extends DomainError {
  readonly code = "MESSAGE_NOT_FOUND";
  constructor() {
    super("Message not found");
  }
}

export class InvalidMediaTypeError extends DomainError {
  readonly code = "INVALID_MEDIA_TYPE";
  constructor(mimeType: string) {
    super(`Unsupported media type: ${mimeType}`);
  }
}

export class FileTooLargeError extends DomainError {
  readonly code = "FILE_TOO_LARGE";
  constructor(size: number, maxSize: number) {
    super(`File size ${size} bytes exceeds maximum of ${maxSize} bytes (50MB)`);
  }
}

export class DuplicateReactionError extends DomainError {
  readonly code = "DUPLICATE_REACTION";
  constructor() {
    super("User has already reacted with this emoji");
  }
}

export class ReactionNotFoundError extends DomainError {
  readonly code = "REACTION_NOT_FOUND";
  constructor() {
    super("Reaction not found");
  }
}

export class EmptyMessageError extends DomainError {
  readonly code = "EMPTY_MESSAGE";
  constructor() {
    super("Message must have content or at least one attachment");
  }
}

export class TooManyAttachmentsError extends DomainError {
  readonly code = "TOO_MANY_ATTACHMENTS";
  constructor(max: number) {
    super(`Maximum ${max} attachments allowed per message`);
  }
}
