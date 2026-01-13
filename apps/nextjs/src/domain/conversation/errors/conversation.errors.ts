import { DomainError } from "@/domain/errors/domain-error";

export class ConversationNotFoundError extends DomainError {
  readonly code = "CONVERSATION_NOT_FOUND";
  constructor() {
    super("Conversation not found");
  }
}

export class UserNotInConversationError extends DomainError {
  readonly code = "USER_NOT_IN_CONVERSATION";
  constructor() {
    super("User is not a participant in this conversation");
  }
}

export class ConversationAlreadyExistsError extends DomainError {
  readonly code = "CONVERSATION_ALREADY_EXISTS";
  constructor() {
    super("A conversation between these participants already exists");
  }
}

export class InvalidParticipantCountError extends DomainError {
  readonly code = "INVALID_PARTICIPANT_COUNT";
  constructor() {
    super("A conversation requires at least 2 participants");
  }
}

export class ParticipantNotFoundError extends DomainError {
  readonly code = "PARTICIPANT_NOT_FOUND";
  constructor() {
    super("Participant not found in conversation");
  }
}
