export const friendKeys = {
  all: ["friends"] as const,
  list: (page?: number, limit?: number) =>
    [...friendKeys.all, "list", { page, limit }] as const,
};

export const friendRequestKeys = {
  all: ["friendRequests"] as const,
  pending: (page?: number, limit?: number) =>
    [...friendRequestKeys.all, "pending", { page, limit }] as const,
};

export const inviteKeys = {
  all: ["invites"] as const,
  myInvite: () => [...inviteKeys.all, "me"] as const,
};

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (page?: number, limit?: number, unreadOnly?: boolean) =>
    [...notificationKeys.all, "list", { page, limit, unreadOnly }] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
};
