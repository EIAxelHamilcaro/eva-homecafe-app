export const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🎉"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export const AVATAR_COLORS = [
  "#F691C3",
  "#FFA500",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#E91E63",
  "#00BCD4",
  "#FF5722",
] as const;

const DEFAULT_COLOR = "#F691C3";

export interface Attachment {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  filename: string;
  dimensions: { width: number; height: number } | null;
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

export interface Recipient {
  id: string;
  name: string;
  email: string;
  image: string | null;
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

export interface GetMessagesResponse {
  messages: Message[];
  pagination: Pagination;
}

export interface SendMessageResponse {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  attachments: Attachment[];
  createdAt: string;
}

export interface CreateConversationResponse {
  conversationId: string;
  isNew: boolean;
}

export interface AddReactionResponse {
  messageId: string;
  userId: string;
  emoji: ReactionEmoji;
  action: "added" | "removed";
}

export interface SearchRecipientsResponse {
  recipients: Recipient[];
}

export interface ProfileBatchResponse {
  profiles: Array<{ id: string; name: string; image: string | null }>;
}

export function getAvatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? DEFAULT_COLOR;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateSeparator(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === yesterday.toDateString()) return "Hier";

  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getOtherParticipantId(
  participants: Participant[],
  currentUserId: string,
): string | undefined {
  return participants.find((p) => p.userId !== currentUserId)?.userId;
}
