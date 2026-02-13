export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

export const conversationKeys = {
  all: ["conversations"] as const,
  list: (pagination?: { page: number; limit: number }) =>
    [...conversationKeys.all, "list", pagination] as const,
  detail: (id: string) => [...conversationKeys.all, id] as const,
};

export const messageKeys = {
  all: ["messages"] as const,
  list: (conversationId: string) =>
    [...messageKeys.all, "list", conversationId] as const,
  detail: (id: string) => [...messageKeys.all, id] as const,
};

export const reactionKeys = {
  all: ["reactions"] as const,
  byMessage: (messageId: string) => [...reactionKeys.all, messageId] as const,
};

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

export const journalKeys = {
  all: ["journal"] as const,
  list: (page?: number, limit?: number, date?: string) =>
    [...journalKeys.all, "list", { page, limit, date }] as const,
  streak: () => [...journalKeys.all, "streak"] as const,
};

export const postKeys = {
  all: ["posts"] as const,
  detail: (id: string) => [...postKeys.all, "detail", id] as const,
  reactions: (postId: string) =>
    [...postKeys.all, "reactions", postId] as const,
};

export const feedKeys = {
  all: ["feed"] as const,
  list: (page?: number, limit?: number) =>
    [...feedKeys.all, "list", { page, limit }] as const,
};

export const boardKeys = {
  all: ["boards"] as const,
  list: (type?: string, page?: number, limit?: number) =>
    [...boardKeys.all, "list", { type, page, limit }] as const,
  detail: (boardId: string) => [...boardKeys.all, "detail", boardId] as const,
  chronology: (month?: string) =>
    [...boardKeys.all, "chronology", { month }] as const,
};

export const galleryKeys = {
  all: ["gallery"] as const,
  list: (page?: number, limit?: number) =>
    [...galleryKeys.all, "list", { page, limit }] as const,
  infinite: (limit?: number) =>
    [...galleryKeys.all, "infinite", { limit }] as const,
};

export const moodKeys = {
  all: ["mood"] as const,
  today: () => [...moodKeys.all, "today"] as const,
  byDate: (date: string) => [...moodKeys.all, "byDate", date] as const,
  week: () => [...moodKeys.all, "week"] as const,
  stats: (period: string) => [...moodKeys.all, "stats", { period }] as const,
  trends: () => [...moodKeys.all, "trends"] as const,
};

export const settingsKeys = {
  all: ["settings"] as const,
  my: () => [...settingsKeys.all, "me"] as const,
};

export const rewardKeys = {
  all: ["rewards"] as const,
  stickers: () => [...rewardKeys.all, "stickers"] as const,
  badges: () => [...rewardKeys.all, "badges"] as const,
};

export const moodboardKeys = {
  all: ["moodboards"] as const,
  list: (page?: number, limit?: number) =>
    [...moodboardKeys.all, "list", { page, limit }] as const,
  infinite: (limit?: number) =>
    [...moodboardKeys.all, "infinite", { limit }] as const,
  detail: (id: string) => [...moodboardKeys.all, "detail", id] as const,
};
