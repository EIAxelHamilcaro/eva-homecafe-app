export type NotificationType =
  | "friend_request"
  | "friend_accepted"
  | "new_message";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  unreadCount: number;
}

export interface MarkNotificationReadInput {
  notificationId: string;
}
