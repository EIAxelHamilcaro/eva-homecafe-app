export type FriendRequestStatus = "pending" | "accepted" | "rejected";

export interface Friend {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string;
  respondedAt: string | null;
}

export interface InviteLink {
  inviteUrl: string;
  token: string;
  expiresAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface GetFriendsResponse {
  friends: Friend[];
  pagination: Pagination;
}

export interface GetPendingRequestsResponse {
  requests: FriendRequest[];
  pagination: Pagination;
}

export interface SendFriendRequestInput {
  receiverId: string;
}

export interface RespondFriendRequestInput {
  requestId: string;
  accept: boolean;
}

export interface AcceptInviteInput {
  token: string;
}
