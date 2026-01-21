export const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export interface Dimensions {
  width: number;
  height: number;
}

export interface Attachment {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  filename: string;
  dimensions: Dimensions | null;
}

export interface Reaction {
  userId: string;
  emoji: ReactionEmoji;
  createdAt: string;
}

export interface Participant {
  userId: string;
  joinedAt: string;
  lastReadAt: string | null;
}

export interface MessagePreview {
  messageId: string;
  content: string;
  senderId: string;
  sentAt: string;
  hasAttachments: boolean;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  createdBy: string;
  lastMessage: MessagePreview | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  attachments: Attachment[];
  reactions: Reaction[];
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetConversationsResponse {
  conversations: Conversation[];
  pagination: Pagination;
}

export interface CreateConversationInput {
  recipientId: string;
}

export interface CreateConversationResponse {
  conversationId: string;
  isNew: boolean;
}

export interface GetMessagesResponse {
  messages: Message[];
  pagination: Pagination;
}

export interface SendMessageInput {
  content?: string;
  attachments?: Attachment[];
}

export interface SendMessageResponse {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  attachments: Attachment[];
  createdAt: string;
}

export interface AddReactionInput {
  emoji: ReactionEmoji;
}

export interface AddReactionResponse {
  messageId: string;
  userId: string;
  emoji: ReactionEmoji;
  action: "added" | "removed";
}

export interface UploadMediaResponse {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  filename: string;
  dimensions: Dimensions | null;
}

export interface Recipient {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface SearchRecipientsResponse {
  recipients: Recipient[];
}

export type SSEEventType =
  | "message:new"
  | "message:updated"
  | "message:deleted"
  | "reaction:added"
  | "reaction:removed"
  | "conversation:read"
  | "conversation:created";

export interface SSEMessageNewEvent {
  type: "message:new";
  data: {
    conversationId: string;
    messageId: string;
    senderId: string;
    content: string | null;
    attachments: Attachment[];
    createdAt: string;
  };
}

export interface SSEMessageUpdatedEvent {
  type: "message:updated";
  data: {
    messageId: string;
    conversationId: string;
    content: string;
    editedAt: string;
  };
}

export interface SSEMessageDeletedEvent {
  type: "message:deleted";
  data: {
    messageId: string;
    conversationId: string;
    deletedAt: string;
  };
}

export interface SSEReactionAddedEvent {
  type: "reaction:added";
  data: {
    messageId: string;
    conversationId: string;
    userId: string;
    emoji: ReactionEmoji;
    createdAt: string;
  };
}

export interface SSEReactionRemovedEvent {
  type: "reaction:removed";
  data: {
    messageId: string;
    conversationId: string;
    userId: string;
    emoji: ReactionEmoji;
  };
}

export interface SSEConversationReadEvent {
  type: "conversation:read";
  data: {
    conversationId: string;
    userId: string;
    lastReadAt: string;
  };
}

export interface SSEConversationCreatedEvent {
  type: "conversation:created";
  data: {
    conversationId: string;
    participants: string[];
    createdBy: string;
    createdAt: string;
  };
}

export type SSEEvent =
  | SSEMessageNewEvent
  | SSEMessageUpdatedEvent
  | SSEMessageDeletedEvent
  | SSEReactionAddedEvent
  | SSEReactionRemovedEvent
  | SSEConversationReadEvent
  | SSEConversationCreatedEvent;
